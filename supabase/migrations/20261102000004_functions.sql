-- =============================================================================
-- RPCs. All write paths that touch several tables run inside ONE function call,
-- which Postgres executes as a single transaction (no N+1, no partial writes).
-- Functions are SECURITY INVOKER and only executable by service_role.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Aggregate counters
-- ---------------------------------------------------------------------------
create or replace function public.bump_stat(p_metric text, p_dimension text default '', p_n integer default 1)
returns void
language sql
set search_path = public
as $$
  insert into public.daily_stats (day, metric, dimension, count)
  values ((now() at time zone 'utc')::date, p_metric, coalesce(p_dimension, ''), p_n)
  on conflict (day, metric, dimension)
  do update set count = public.daily_stats.count + excluded.count;
$$;

-- Batch form: p_events = [{"m": "quiz_opened", "d": "", "n": 1}, ...]
create or replace function public.bump_stats(p_events jsonb)
returns void
language sql
set search_path = public
as $$
  insert into public.daily_stats (day, metric, dimension, count)
  select (now() at time zone 'utc')::date,
         left(e->>'m', 40),
         left(coalesce(e->>'d', ''), 40),
         sum(greatest(1, least(coalesce((e->>'n')::int, 1), 1000)))
  from jsonb_array_elements(p_events) as e
  where e ? 'm'
  group by 2, 3
  on conflict (day, metric, dimension)
  do update set count = public.daily_stats.count + excluded.count;
$$;

-- ---------------------------------------------------------------------------
-- create_quiz: inserts the quiz + all questions + stats atomically.
-- ---------------------------------------------------------------------------
create or replace function public.create_quiz(p_quiz jsonb, p_questions jsonb)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_id     uuid;
  v_size   int := (p_quiz->>'size')::int;
  v_source text := coalesce(p_quiz->>'source', 'direct');
begin
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) <> v_size then
    raise exception 'question_count_mismatch' using errcode = '22023';
  end if;

  insert into public.quizzes (slug, title, creator_nickname, avatar, pack, size, token_hash,
                              ref_code, referred_by, source, expires_at)
  values (p_quiz->>'slug', p_quiz->>'title', p_quiz->>'creator_nickname', p_quiz->>'avatar',
          coalesce(p_quiz->>'pack', 'mixed'), v_size, p_quiz->>'token_hash', p_quiz->>'ref_code',
          nullif(p_quiz->>'referred_by', ''), v_source, nullif(p_quiz->>'expires_at', '')::timestamptz)
  returning id into v_id;

  insert into public.questions (quiz_id, position, text, options, correct_index, category, bank_id)
  select v_id,
         (t.ord - 1)::smallint,
         t.q->>'text',
         array(select jsonb_array_elements_text(t.q->'options')),
         (t.q->>'correct_index')::smallint,
         coalesce(nullif(t.q->>'category', ''), 'custom'),
         nullif(t.q->>'bank_id', '')
  from jsonb_array_elements(p_questions) with ordinality as t(q, ord);

  -- aggregate analytics, same transaction
  perform public.bump_stat('quiz_published', '', 1);
  perform public.bump_stat('quiz_size', v_size::text, 1);
  if v_source <> 'direct' then
    perform public.bump_stat('create_from_result', v_source, 1);
  end if;

  insert into public.daily_stats (day, metric, dimension, count)
  select (now() at time zone 'utc')::date, 'category', category, count(*)
  from public.questions where quiz_id = v_id group by category
  on conflict (day, metric, dimension)
  do update set count = public.daily_stats.count + excluded.count;

  return jsonb_build_object('id', v_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- submit_attempt: validates, scores server-side, stores attempt + responses (batch),
-- updates quiz aggregates and daily stats. Idempotent on (quiz_id, idempotency_key).
-- ---------------------------------------------------------------------------
create or replace function public.submit_attempt(
  p_slug            text,
  p_answers         int[],
  p_idempotency_key uuid,
  p_view_key_hash   text,
  p_ref_code        text,
  p_nickname        text default null,
  p_referred_by     text default null
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_quiz       public.quizzes%rowtype;
  v_existing   public.attempts%rowtype;
  v_total      int;
  v_score      int;
  v_invalid    int;
  v_attempt_id uuid;
  v_hist       int[];
  v_count      int;
  v_below      bigint;
  v_others     int;
begin
  select * into v_quiz from public.quizzes where slug = p_slug;
  if not found or v_quiz.status <> 'active'
     or (v_quiz.expires_at is not null and v_quiz.expires_at <= now()) then
    raise exception 'quiz_unavailable' using errcode = 'P0002';
  end if;

  -- Idempotency fast path (double tap, network retry)
  select * into v_existing from public.attempts
   where quiz_id = v_quiz.id and idempotency_key = p_idempotency_key;
  if found then
    v_hist := v_quiz.score_hist;
    select coalesce(sum(x), 0) into v_below from unnest(v_hist[1:v_existing.score]) as x;
    v_others := greatest(v_quiz.attempts_count - 1, 0);
    return jsonb_build_object(
      'attempt_id', v_existing.id, 'score', v_existing.score, 'total', v_existing.total,
      'percentile', case when v_others = 0 then null else round(100.0 * v_below / v_others) end,
      'others', v_others, 'ref_code', v_existing.ref_code, 'duplicate', true);
  end if;

  select count(*) into v_total from public.questions where quiz_id = v_quiz.id;
  if coalesce(array_length(p_answers, 1), 0) <> v_total then
    raise exception 'answer_count_mismatch' using errcode = '22023';
  end if;

  select count(*) filter (where a.val = q.correct_index),
         count(*) filter (where a.val is null or a.val < 0 or a.val >= array_length(q.options, 1))
    into v_score, v_invalid
    from public.questions q
    join unnest(p_answers) with ordinality as a(val, ord) on q.position = a.ord - 1
   where q.quiz_id = v_quiz.id;

  if v_invalid > 0 then
    raise exception 'invalid_answer' using errcode = '22023';
  end if;

  insert into public.attempts (quiz_id, nickname, score, total, idempotency_key, view_key_hash,
                               ref_code, referred_by)
  values (v_quiz.id, nullif(p_nickname, ''), v_score, v_total, p_idempotency_key, p_view_key_hash,
          p_ref_code, nullif(p_referred_by, ''))
  on conflict (quiz_id, idempotency_key) do nothing
  returning id into v_attempt_id;

  if v_attempt_id is null then
    -- Lost a race with a concurrent identical submission: return the winner.
    select * into v_existing from public.attempts
     where quiz_id = v_quiz.id and idempotency_key = p_idempotency_key;
    return jsonb_build_object(
      'attempt_id', v_existing.id, 'score', v_existing.score, 'total', v_existing.total,
      'percentile', null, 'others', 0, 'ref_code', v_existing.ref_code, 'duplicate', true);
  end if;

  -- One batch insert for all responses
  insert into public.responses (attempt_id, question_id, selected_index, is_correct)
  select v_attempt_id, q.id, a.val::smallint, a.val = q.correct_index
    from public.questions q
    join unnest(p_answers) with ordinality as a(val, ord) on q.position = a.ord - 1
   where q.quiz_id = v_quiz.id;

  update public.quizzes
     set attempts_count = attempts_count + 1,
         score_sum = score_sum + v_score,
         best_score = greatest(best_score, v_score),
         score_hist[v_score + 1] = coalesce(score_hist[v_score + 1], 0) + 1,
         last_attempt_at = now()
   where id = v_quiz.id
  returning score_hist, attempts_count into v_hist, v_count;

  select coalesce(sum(x), 0) into v_below from unnest(v_hist[1:v_score]) as x;
  v_others := greatest(v_count - 1, 0);

  perform public.bump_stat('quiz_completed', '', 1);
  perform public.bump_stat('score_pct', (round(10.0 * v_score / greatest(v_total, 1)) * 10)::int::text, 1);

  return jsonb_build_object(
    'attempt_id', v_attempt_id, 'score', v_score, 'total', v_total,
    'percentile', case when v_others = 0 then null else round(100.0 * v_below / v_others) end,
    'others', v_others, 'ref_code', p_ref_code, 'duplicate', false);
end;
$$;

-- ---------------------------------------------------------------------------
-- track_share: per-quiz share counter + daily channel stats
-- ---------------------------------------------------------------------------
create or replace function public.track_share(p_slug text, p_channel text, p_kind text)
returns void
language plpgsql
set search_path = public
as $$
begin
  if p_slug is not null and p_kind = 'quiz' then
    update public.quizzes set share_count = share_count + 1 where slug = p_slug;
  end if;
  perform public.bump_stat(case when p_kind = 'result' then 'result_shared' else 'share' end,
                           left(coalesce(p_channel, 'other'), 40), 1);
end;
$$;

-- ---------------------------------------------------------------------------
-- Lock down execution
-- ---------------------------------------------------------------------------
revoke all on function public.bump_stat(text, text, integer)       from public, anon, authenticated;
revoke all on function public.bump_stats(jsonb)                    from public, anon, authenticated;
revoke all on function public.create_quiz(jsonb, jsonb)            from public, anon, authenticated;
revoke all on function public.submit_attempt(text, int[], uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.track_share(text, text, text)        from public, anon, authenticated;

grant execute on function public.bump_stat(text, text, integer)    to service_role;
grant execute on function public.bump_stats(jsonb)                 to service_role;
grant execute on function public.create_quiz(jsonb, jsonb)         to service_role;
grant execute on function public.submit_attempt(text, int[], uuid, text, text, text, text) to service_role;
grant execute on function public.track_share(text, text, text)     to service_role;
