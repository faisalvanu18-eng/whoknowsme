-- =============================================================================
-- Who Knows You Better? : core schema
-- No personal data: no emails, phones, real names or IP addresses are stored.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- quizzes: one row per published quiz. Lives until the creator deletes it
-- (or until expires_at when the optional 30-day expiry is chosen).
-- ---------------------------------------------------------------------------
create table if not exists public.quizzes (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]{8,12}$'),
  title             text not null check (char_length(title) between 3 and 80),
  creator_nickname  text not null check (char_length(creator_nickname) between 1 and 24),
  avatar            text not null check (avatar ~ '^[a-z]+-[a-z]+$'),
  pack              text not null default 'mixed' check (char_length(pack) <= 32),
  size              smallint not null check (size in (5, 10, 15)),
  -- sha256(hex) of the creator's 32-byte secret token. The token itself is never stored.
  token_hash        text not null unique check (char_length(token_hash) = 64),
  -- short anonymous referral code for links shared by this creator (?ref=)
  ref_code          text not null unique check (ref_code ~ '^[a-z0-9]{6,10}$'),
  -- ref code that led to this quiz being created (another quiz or a result), if any
  referred_by       text check (referred_by is null or referred_by ~ '^[a-z0-9]{6,10}$'),
  source            text not null default 'direct' check (source in ('direct', 'result', 'challenge', 'remix')),
  status            text not null default 'active' check (status in ('active', 'disabled')),
  expires_at        timestamptz,
  created_at        timestamptz not null default now(),

  -- Aggregate counters (persist after the 7-day attempt cleanup)
  attempts_count    integer not null default 0,
  score_sum         integer not null default 0,
  best_score        smallint not null default 0,
  -- score_hist[i+1] = number of attempts that scored exactly i. Enables "you beat X%" without raw rows.
  score_hist        integer[] not null default array_fill(0, array[16]),
  share_count       integer not null default 0,
  last_attempt_at   timestamptz
);

-- ---------------------------------------------------------------------------
-- questions: the correct answer lives here and is only readable by server code.
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes(id) on delete cascade,
  position       smallint not null check (position between 0 and 14),
  text           text not null check (char_length(text) between 3 and 120),
  options        text[] not null check (array_length(options, 1) between 2 and 4),
  correct_index  smallint not null check (correct_index between 0 and 3),
  category       text not null default 'custom' check (char_length(category) <= 32),
  bank_id        text check (bank_id is null or char_length(bank_id) <= 40),
  unique (quiz_id, position),
  check (correct_index < array_length(options, 1))
);

-- ---------------------------------------------------------------------------
-- attempts: one per friend play. Auto-deleted after 7 days.
-- ---------------------------------------------------------------------------
create table if not exists public.attempts (
  id               uuid primary key default gen_random_uuid(),
  quiz_id          uuid not null references public.quizzes(id) on delete cascade,
  nickname         text check (nickname is null or char_length(nickname) between 1 and 24),
  score            smallint not null,
  total            smallint not null,
  -- client-generated UUID; unique per quiz so double-taps / retries never double-score
  idempotency_key  uuid not null,
  -- sha256(hex) of a per-attempt secret kept in an httpOnly cookie; unlocks the answer review
  view_key_hash    text not null check (char_length(view_key_hash) = 64),
  ref_code         text not null unique check (ref_code ~ '^[a-z0-9]{6,10}$'),
  referred_by      text check (referred_by is null or referred_by ~ '^[a-z0-9]{6,10}$'),
  created_at       timestamptz not null default now(),
  unique (quiz_id, idempotency_key)
);

-- ---------------------------------------------------------------------------
-- responses: one row per answered question. Cascades with attempts (7 days).
-- ---------------------------------------------------------------------------
create table if not exists public.responses (
  attempt_id      uuid not null references public.attempts(id) on delete cascade,
  question_id     uuid not null references public.questions(id) on delete cascade,
  selected_index  smallint not null check (selected_index between 0 and 3),
  is_correct      boolean not null,
  primary key (attempt_id, question_id)
);

-- ---------------------------------------------------------------------------
-- reports: abuse reports. Separate retention (see cleanup function).
-- quiz_id is nulled when the quiz is deleted; the snapshot keeps context for moderators.
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid references public.quizzes(id) on delete set null,
  quiz_slug       text not null,
  title_snapshot  text not null,
  reason          text not null check (reason in ('offensive', 'harassment', 'personal_info', 'spam', 'sexual', 'other')),
  details         text check (details is null or char_length(details) <= 500),
  status          text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

-- ---------------------------------------------------------------------------
-- daily_stats: first-party aggregate counters only (no per-user rows).
-- metric examples: visit, quiz_opened, quiz_started, quiz_completed, quiz_published,
-- share (dimension = channel), result_shared, create_from_result, category (dimension = name)
-- ---------------------------------------------------------------------------
create table if not exists public.daily_stats (
  day        date not null default (now() at time zone 'utc')::date,
  metric     text not null check (char_length(metric) <= 40),
  dimension  text not null default '' check (char_length(dimension) <= 40),
  count      bigint not null default 0,
  primary key (day, metric, dimension)
);
