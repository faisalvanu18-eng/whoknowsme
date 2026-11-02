-- =============================================================================
-- Indexes. Every hot query path is covered; FK columns are indexed so cascades stay fast.
-- =============================================================================

-- quizzes: slug / token_hash / ref_code already have unique indexes.
create index if not exists quizzes_created_at_idx on public.quizzes (created_at desc);
create index if not exists quizzes_expires_at_idx on public.quizzes (expires_at) where expires_at is not null;
create index if not exists quizzes_status_idx on public.quizzes (status) where status <> 'active';

-- questions: (quiz_id, position) unique index covers "load quiz in order".

-- attempts: dashboard leaderboard (by score), recent list and the 7-day cleanup.
create index if not exists attempts_quiz_score_idx on public.attempts (quiz_id, score desc, created_at asc);
create index if not exists attempts_created_at_idx on public.attempts (created_at);

-- responses: PK covers attempt_id; this one makes question-delete cascades cheap.
create index if not exists responses_question_idx on public.responses (question_id);

-- reports: moderation queue.
create index if not exists reports_status_created_idx on public.reports (status, created_at desc);
create index if not exists reports_quiz_idx on public.reports (quiz_id);

-- daily_stats: PK (day, metric, dimension) covers range scans by day.
create index if not exists daily_stats_metric_day_idx on public.daily_stats (metric, day);
