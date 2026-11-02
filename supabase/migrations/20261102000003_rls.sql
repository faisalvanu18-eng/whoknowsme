-- =============================================================================
-- Row Level Security: enabled on every table with NO policies for anon/authenticated,
-- so the public anon key can read or write nothing.
-- All access goes through Next.js server code using the service-role key (BYPASSRLS).
-- Table privileges are revoked too, so even an accidental "disable RLS" leaks nothing.
--
-- We intentionally do NOT use FORCE ROW LEVEL SECURITY: the hourly pg_cron cleanup runs as the
-- table owner (postgres), and forcing RLS on the owner would make those deletes silently no-op.
-- =============================================================================

alter table public.quizzes     enable row level security;
alter table public.questions   enable row level security;
alter table public.attempts    enable row level security;
alter table public.responses   enable row level security;
alter table public.reports     enable row level security;
alter table public.daily_stats enable row level security;

revoke all on public.quizzes, public.questions, public.attempts, public.responses,
              public.reports, public.daily_stats
  from anon, authenticated;

grant select, insert, update, delete on public.quizzes, public.questions, public.attempts,
              public.responses, public.reports, public.daily_stats
  to service_role;

-- Future tables/functions in this schema also start locked down.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from anon, authenticated, public;
