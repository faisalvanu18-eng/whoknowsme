-- =============================================================================
-- Retention + automatic cleanup (pg_cron, hourly)
--   attempts + responses ......... 7 days after creation (responses cascade)
--   quizzes with expires_at ...... deleted once expired (optional 30-day expiry)
--   reports (resolved) ........... 90 days after resolution
--   reports (any) ................ 180 days after creation (hard cap)
--   daily_stats .................. 2 years (aggregate counters only)
-- Deletes run in batches so a big backlog never holds long locks.
-- =============================================================================

create or replace function public.run_retention_cleanup(p_batch int default 5000)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_attempts int := 0;
  v_quizzes  int := 0;
  v_reports  int := 0;
  v_stats    int := 0;
  v_n        int;
  v_loops    int := 0;
begin
  loop
    delete from public.attempts
     where id in (select id from public.attempts
                   where created_at < now() - interval '7 days'
                   limit p_batch);
    get diagnostics v_n = row_count;
    v_attempts := v_attempts + v_n;
    v_loops := v_loops + 1;
    exit when v_n < p_batch or v_loops >= 40;
  end loop;

  v_loops := 0;
  loop
    delete from public.quizzes
     where id in (select id from public.quizzes
                   where expires_at is not null and expires_at <= now()
                   limit p_batch);
    get diagnostics v_n = row_count;
    v_quizzes := v_quizzes + v_n;
    v_loops := v_loops + 1;
    exit when v_n < p_batch or v_loops >= 20;
  end loop;

  delete from public.reports
   where (status <> 'open' and resolved_at < now() - interval '90 days')
      or created_at < now() - interval '180 days';
  get diagnostics v_reports = row_count;

  delete from public.daily_stats where day < ((now() at time zone 'utc')::date - 730);
  get diagnostics v_stats = row_count;

  return jsonb_build_object('attempts', v_attempts, 'quizzes', v_quizzes,
                            'reports', v_reports, 'daily_stats', v_stats);
end;
$$;

revoke all on function public.run_retention_cleanup(int) from public, anon, authenticated;
grant execute on function public.run_retention_cleanup(int) to service_role;

-- pg_cron: Supabase installs it in pg_catalog (same as Dashboard > Integrations > Cron).
create extension if not exists pg_cron with schema pg_catalog;

-- Re-runnable: drop the old job if present, then schedule hourly at minute 7.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'wkyb-retention-hourly') then
    perform cron.unschedule('wkyb-retention-hourly');
  end if;
  perform cron.schedule('wkyb-retention-hourly', '7 * * * *', 'select public.run_retention_cleanup()');
end;
$$;
