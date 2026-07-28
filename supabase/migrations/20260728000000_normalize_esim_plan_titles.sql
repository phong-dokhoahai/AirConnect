-- Keep eSIM plan titles as names only; data and validity live in dedicated columns.

with normalized_titles (id, title) as (
  values
    ('33333333-3333-4333-8333-333333333331'::uuid, 'Japan Light'),
    ('33333333-3333-4333-8333-333333333332'::uuid, 'Thailand Moderate'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'Asia Unlimited'),
    ('33333333-3333-4333-8333-333333333334'::uuid, 'Europe Heavy'),
    ('44444444-4444-4444-8444-444444444111'::uuid, 'Japan Moderate'),
    ('44444444-4444-4444-8444-444444444112'::uuid, 'Japan Heavy'),
    ('44444444-4444-4444-8444-444444444113'::uuid, 'Japan Unlimited'),
    ('44444444-4444-4444-8444-444444444121'::uuid, 'Thailand Light'),
    ('44444444-4444-4444-8444-444444444122'::uuid, 'Thailand Heavy'),
    ('44444444-4444-4444-8444-444444444123'::uuid, 'Thailand Unlimited'),
    ('44444444-4444-4444-8444-444444444131'::uuid, 'Vietnam Light'),
    ('44444444-4444-4444-8444-444444444132'::uuid, 'Vietnam Moderate'),
    ('44444444-4444-4444-8444-444444444133'::uuid, 'Vietnam Heavy'),
    ('44444444-4444-4444-8444-444444444134'::uuid, 'Vietnam Unlimited'),
    ('44444444-4444-4444-8444-444444444141'::uuid, 'Singapore Light'),
    ('44444444-4444-4444-8444-444444444142'::uuid, 'Singapore Moderate'),
    ('44444444-4444-4444-8444-444444444143'::uuid, 'Singapore Heavy'),
    ('44444444-4444-4444-8444-444444444144'::uuid, 'Singapore Unlimited'),
    ('44444444-4444-4444-8444-444444444151'::uuid, 'South Korea Light'),
    ('44444444-4444-4444-8444-444444444152'::uuid, 'South Korea Moderate'),
    ('44444444-4444-4444-8444-444444444153'::uuid, 'South Korea Heavy'),
    ('44444444-4444-4444-8444-444444444154'::uuid, 'South Korea Unlimited'),
    ('44444444-4444-4444-8444-444444444161'::uuid, 'United States Light'),
    ('44444444-4444-4444-8444-444444444171'::uuid, 'France Light'),
    ('44444444-4444-4444-8444-444444444181'::uuid, 'Spain Light'),
    ('44444444-4444-4444-8444-444444444191'::uuid, 'Italy Light')
)
update public.esim_plans
set title = normalized_titles.title
from normalized_titles
where esim_plans.id = normalized_titles.id;
