-- =============================================================================
-- Every question can now have a 5th choice ("Other"): options 2..5, index 0..4.
-- Re-creates the CHECK constraints on questions/responses (names differ per Postgres version,
-- so we look them up instead of hard-coding them). Safe to re-run.
-- =============================================================================

do $$
declare r record;
begin
  for r in select conname from pg_constraint where conrelid = 'public.questions'::regclass and contype = 'c' loop
    execute format('alter table public.questions drop constraint %I', r.conname);
  end loop;
  for r in select conname from pg_constraint where conrelid = 'public.responses'::regclass and contype = 'c' loop
    execute format('alter table public.responses drop constraint %I', r.conname);
  end loop;
end;
$$;

alter table public.questions
  add constraint questions_position_chk      check (position between 0 and 14),
  add constraint questions_text_chk          check (char_length(text) between 3 and 120),
  add constraint questions_options_chk       check (array_length(options, 1) between 2 and 5),
  add constraint questions_correct_index_chk check (correct_index between 0 and 4),
  add constraint questions_category_chk      check (char_length(category) <= 32),
  add constraint questions_bank_id_chk       check (bank_id is null or char_length(bank_id) <= 40),
  add constraint questions_index_in_options_chk check (correct_index < array_length(options, 1));

alter table public.responses
  add constraint responses_selected_index_chk check (selected_index between 0 and 4);
