-- =============================================================================
-- Local/dev seed. Creates one demo quiz you can play at /quiz/demo1234.
-- Demo dashboard: /dashboard/DemoDashboardTokenForLocalDevOnly0000000000
-- DO NOT run this against production (the token is public).
-- =============================================================================

insert into public.quizzes (slug, title, creator_nickname, avatar, pack, size, token_hash, ref_code, source)
values (
  'demo1234',
  'How well do you know Sam?',
  'Sam',
  'fox-violet',
  'best-friends',
  5,
  encode(extensions.digest('DemoDashboardTokenForLocalDevOnly0000000000', 'sha256'), 'hex'),
  'demoref1',
  'direct'
)
on conflict (slug) do nothing;

insert into public.questions (quiz_id, position, text, options, correct_index, category, bank_id)
select q.id, v.position, v.text, v.options, v.correct_index, v.category, v.bank_id
from public.quizzes q
cross join (values
  (0::smallint, 'What''s my go-to comfort food?', array['Pizza','Noodles','Biryani','Ice cream'], 2::smallint, 'food', 'food-01'),
  (1::smallint, 'What would I do with a free Sunday?', array['Sleep till noon','Binge a series','Go out with friends','Try a new hobby'], 1::smallint, 'best-friends', 'bf-02'),
  (2::smallint, 'Pick my dream holiday', array['Beach','Mountains','Big city','Road trip'], 1::smallint, 'travel', 'tr-01'),
  (3::smallint, 'Am I a morning person or a night owl?', array['Early bird','Night owl','Depends on the day','Always tired'], 1::smallint, 'personality', 'pe-01'),
  (4::smallint, 'Which superpower would I pick?', array['Flying','Invisibility','Teleporting','Reading minds'], 2::smallint, 'random', 'ra-01')
) as v(position, text, options, correct_index, category, bank_id)
where q.slug = 'demo1234'
on conflict (quiz_id, position) do nothing;
