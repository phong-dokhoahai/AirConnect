-- Seed country-specific usage-tier plans for onboarding recommendations.
-- Every seeded country gets a light plan. Countries in the Asia region get
-- light, moderate, heavy, and unlimited country plans.

alter table public.esim_plans
add column if not exists usage_tier text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'esim_plans_usage_tier_check'
  ) then
    alter table public.esim_plans
    add constraint esim_plans_usage_tier_check
    check (
      usage_tier is null
      or usage_tier in ('light', 'moderate', 'heavy', 'unlimited')
    );
  end if;
end;
$$;

create index if not exists esim_plans_usage_tier_idx
on public.esim_plans (usage_tier);

update public.esim_plans
set usage_tier = 'light'
where id = '33333333-3333-4333-8333-333333333331';

update public.esim_plans
set usage_tier = 'moderate'
where id = '33333333-3333-4333-8333-333333333332';

update public.esim_plans
set usage_tier = 'unlimited'
where id = '33333333-3333-4333-8333-333333333333';

update public.esim_plans
set usage_tier = 'heavy'
where id = '33333333-3333-4333-8333-333333333334';

with plan_seed (
  id,
  iso2,
  country_name,
  usage_tier,
  data_amount_gb,
  is_unlimited,
  validity_days,
  price,
  network_name,
  network_type
) as (
  values
    ('44444444-4444-4444-8444-444444444111'::uuid, 'JP', 'Japan', 'moderate', 10::numeric, false, 15, 12.99::numeric, 'NTT Docomo', '5G'),
    ('44444444-4444-4444-8444-444444444112'::uuid, 'JP', 'Japan', 'heavy', 20::numeric, false, 30, 24.99::numeric, 'NTT Docomo', '5G'),
    ('44444444-4444-4444-8444-444444444113'::uuid, 'JP', 'Japan', 'unlimited', null::numeric, true, 30, 39.99::numeric, 'NTT Docomo', '5G'),
    ('44444444-4444-4444-8444-444444444121'::uuid, 'TH', 'Thailand', 'light', 3::numeric, false, 7, 5.99::numeric, 'AIS', '5G'),
    ('44444444-4444-4444-8444-444444444122'::uuid, 'TH', 'Thailand', 'heavy', 20::numeric, false, 30, 24.99::numeric, 'AIS', '5G'),
    ('44444444-4444-4444-8444-444444444123'::uuid, 'TH', 'Thailand', 'unlimited', null::numeric, true, 30, 39.99::numeric, 'AIS', '5G'),
    ('44444444-4444-4444-8444-444444444131'::uuid, 'VN', 'Vietnam', 'light', 3::numeric, false, 7, 5.99::numeric, 'Viettel', '4G'),
    ('44444444-4444-4444-8444-444444444132'::uuid, 'VN', 'Vietnam', 'moderate', 10::numeric, false, 15, 12.99::numeric, 'Viettel', '4G'),
    ('44444444-4444-4444-8444-444444444133'::uuid, 'VN', 'Vietnam', 'heavy', 20::numeric, false, 30, 24.99::numeric, 'Viettel', '4G'),
    ('44444444-4444-4444-8444-444444444134'::uuid, 'VN', 'Vietnam', 'unlimited', null::numeric, true, 30, 39.99::numeric, 'Viettel', '4G'),
    ('44444444-4444-4444-8444-444444444141'::uuid, 'SG', 'Singapore', 'light', 3::numeric, false, 7, 5.99::numeric, 'Singtel', '5G'),
    ('44444444-4444-4444-8444-444444444142'::uuid, 'SG', 'Singapore', 'moderate', 10::numeric, false, 15, 12.99::numeric, 'Singtel', '5G'),
    ('44444444-4444-4444-8444-444444444143'::uuid, 'SG', 'Singapore', 'heavy', 20::numeric, false, 30, 24.99::numeric, 'Singtel', '5G'),
    ('44444444-4444-4444-8444-444444444144'::uuid, 'SG', 'Singapore', 'unlimited', null::numeric, true, 30, 39.99::numeric, 'Singtel', '5G'),
    ('44444444-4444-4444-8444-444444444151'::uuid, 'KR', 'South Korea', 'light', 3::numeric, false, 7, 5.99::numeric, 'SK Telecom', '5G'),
    ('44444444-4444-4444-8444-444444444152'::uuid, 'KR', 'South Korea', 'moderate', 10::numeric, false, 15, 12.99::numeric, 'SK Telecom', '5G'),
    ('44444444-4444-4444-8444-444444444153'::uuid, 'KR', 'South Korea', 'heavy', 20::numeric, false, 30, 24.99::numeric, 'SK Telecom', '5G'),
    ('44444444-4444-4444-8444-444444444154'::uuid, 'KR', 'South Korea', 'unlimited', null::numeric, true, 30, 39.99::numeric, 'SK Telecom', '5G'),
    ('44444444-4444-4444-8444-444444444161'::uuid, 'US', 'United States', 'light', 3::numeric, false, 7, 6.99::numeric, 'T-Mobile', '5G'),
    ('44444444-4444-4444-8444-444444444171'::uuid, 'FR', 'France', 'light', 3::numeric, false, 7, 5.99::numeric, 'Orange France', '5G'),
    ('44444444-4444-4444-8444-444444444181'::uuid, 'ES', 'Spain', 'light', 3::numeric, false, 7, 5.99::numeric, 'Movistar', '5G'),
    ('44444444-4444-4444-8444-444444444191'::uuid, 'IT', 'Italy', 'light', 3::numeric, false, 7, 5.99::numeric, 'TIM', '5G')
)
insert into public.esim_plans (
  id,
  title,
  description,
  data_amount_gb,
  is_unlimited,
  validity_days,
  price,
  currency,
  provider_name,
  activation_policy,
  tethering_supported,
  supports_5g,
  is_active,
  usage_tier
)
select
  id,
  country_name || ' ' ||
    case usage_tier
      when 'light' then 'Light 3GB / 7 Days'
      when 'moderate' then 'Moderate 10GB / 15 Days'
      when 'heavy' then 'Heavy 20GB / 30 Days'
      else 'Unlimited / 30 Days'
    end,
  case usage_tier
    when 'light' then 'A light eSIM plan for maps, messaging, and short trips in ' || country_name || '.'
    when 'moderate' then 'A balanced eSIM plan for social media, browsing, and navigation in ' || country_name || '.'
    when 'heavy' then 'A high-data eSIM plan for streaming, calls, and longer stays in ' || country_name || '.'
    else 'An unlimited eSIM plan for maximum flexibility in ' || country_name || '.'
  end,
  data_amount_gb,
  is_unlimited,
  validity_days,
  price,
  'USD',
  'AirConnect',
  'Validity starts when the eSIM first connects to a supported network in ' || country_name || '.',
  true,
  network_type = '5G',
  true,
  usage_tier
from plan_seed
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    data_amount_gb = excluded.data_amount_gb,
    is_unlimited = excluded.is_unlimited,
    validity_days = excluded.validity_days,
    price = excluded.price,
    currency = excluded.currency,
    provider_name = excluded.provider_name,
    activation_policy = excluded.activation_policy,
    tethering_supported = excluded.tethering_supported,
    supports_5g = excluded.supports_5g,
    is_active = excluded.is_active,
    usage_tier = excluded.usage_tier;

with plan_seed (id, iso2) as (
  values
    ('44444444-4444-4444-8444-444444444111'::uuid, 'JP'),
    ('44444444-4444-4444-8444-444444444112'::uuid, 'JP'),
    ('44444444-4444-4444-8444-444444444113'::uuid, 'JP'),
    ('44444444-4444-4444-8444-444444444121'::uuid, 'TH'),
    ('44444444-4444-4444-8444-444444444122'::uuid, 'TH'),
    ('44444444-4444-4444-8444-444444444123'::uuid, 'TH'),
    ('44444444-4444-4444-8444-444444444131'::uuid, 'VN'),
    ('44444444-4444-4444-8444-444444444132'::uuid, 'VN'),
    ('44444444-4444-4444-8444-444444444133'::uuid, 'VN'),
    ('44444444-4444-4444-8444-444444444134'::uuid, 'VN'),
    ('44444444-4444-4444-8444-444444444141'::uuid, 'SG'),
    ('44444444-4444-4444-8444-444444444142'::uuid, 'SG'),
    ('44444444-4444-4444-8444-444444444143'::uuid, 'SG'),
    ('44444444-4444-4444-8444-444444444144'::uuid, 'SG'),
    ('44444444-4444-4444-8444-444444444151'::uuid, 'KR'),
    ('44444444-4444-4444-8444-444444444152'::uuid, 'KR'),
    ('44444444-4444-4444-8444-444444444153'::uuid, 'KR'),
    ('44444444-4444-4444-8444-444444444154'::uuid, 'KR'),
    ('44444444-4444-4444-8444-444444444161'::uuid, 'US'),
    ('44444444-4444-4444-8444-444444444171'::uuid, 'FR'),
    ('44444444-4444-4444-8444-444444444181'::uuid, 'ES'),
    ('44444444-4444-4444-8444-444444444191'::uuid, 'IT')
)
insert into public.plan_countries (plan_id, country_id)
select plan_seed.id, countries.id
from plan_seed
join public.countries on countries.iso2 = plan_seed.iso2
on conflict do nothing;

with plan_seed (
  id,
  iso2,
  country_name,
  usage_tier,
  data_amount_gb,
  is_unlimited,
  network_name,
  network_type
) as (
  values
    ('44444444-4444-4444-8444-444444444111'::uuid, 'JP', 'Japan', 'moderate', 10::numeric, false, 'NTT Docomo', '5G'),
    ('44444444-4444-4444-8444-444444444112'::uuid, 'JP', 'Japan', 'heavy', 20::numeric, false, 'NTT Docomo', '5G'),
    ('44444444-4444-4444-8444-444444444113'::uuid, 'JP', 'Japan', 'unlimited', null::numeric, true, 'NTT Docomo', '5G'),
    ('44444444-4444-4444-8444-444444444121'::uuid, 'TH', 'Thailand', 'light', 3::numeric, false, 'AIS', '5G'),
    ('44444444-4444-4444-8444-444444444122'::uuid, 'TH', 'Thailand', 'heavy', 20::numeric, false, 'AIS', '5G'),
    ('44444444-4444-4444-8444-444444444123'::uuid, 'TH', 'Thailand', 'unlimited', null::numeric, true, 'AIS', '5G'),
    ('44444444-4444-4444-8444-444444444131'::uuid, 'VN', 'Vietnam', 'light', 3::numeric, false, 'Viettel', '4G'),
    ('44444444-4444-4444-8444-444444444132'::uuid, 'VN', 'Vietnam', 'moderate', 10::numeric, false, 'Viettel', '4G'),
    ('44444444-4444-4444-8444-444444444133'::uuid, 'VN', 'Vietnam', 'heavy', 20::numeric, false, 'Viettel', '4G'),
    ('44444444-4444-4444-8444-444444444134'::uuid, 'VN', 'Vietnam', 'unlimited', null::numeric, true, 'Viettel', '4G'),
    ('44444444-4444-4444-8444-444444444141'::uuid, 'SG', 'Singapore', 'light', 3::numeric, false, 'Singtel', '5G'),
    ('44444444-4444-4444-8444-444444444142'::uuid, 'SG', 'Singapore', 'moderate', 10::numeric, false, 'Singtel', '5G'),
    ('44444444-4444-4444-8444-444444444143'::uuid, 'SG', 'Singapore', 'heavy', 20::numeric, false, 'Singtel', '5G'),
    ('44444444-4444-4444-8444-444444444144'::uuid, 'SG', 'Singapore', 'unlimited', null::numeric, true, 'Singtel', '5G'),
    ('44444444-4444-4444-8444-444444444151'::uuid, 'KR', 'South Korea', 'light', 3::numeric, false, 'SK Telecom', '5G'),
    ('44444444-4444-4444-8444-444444444152'::uuid, 'KR', 'South Korea', 'moderate', 10::numeric, false, 'SK Telecom', '5G'),
    ('44444444-4444-4444-8444-444444444153'::uuid, 'KR', 'South Korea', 'heavy', 20::numeric, false, 'SK Telecom', '5G'),
    ('44444444-4444-4444-8444-444444444154'::uuid, 'KR', 'South Korea', 'unlimited', null::numeric, true, 'SK Telecom', '5G'),
    ('44444444-4444-4444-8444-444444444161'::uuid, 'US', 'United States', 'light', 3::numeric, false, 'T-Mobile', '5G'),
    ('44444444-4444-4444-8444-444444444171'::uuid, 'FR', 'France', 'light', 3::numeric, false, 'Orange France', '5G'),
    ('44444444-4444-4444-8444-444444444181'::uuid, 'ES', 'Spain', 'light', 3::numeric, false, 'Movistar', '5G'),
    ('44444444-4444-4444-8444-444444444191'::uuid, 'IT', 'Italy', 'light', 3::numeric, false, 'TIM', '5G')
)
insert into public.plan_networks (
  plan_id,
  country_id,
  network_name,
  coverage_note,
  network_type
)
select
  plan_seed.id,
  countries.id,
  plan_seed.network_name,
  country_name || ' ' || usage_tier || ' plan access on ' || network_name || '.',
  plan_seed.network_type
from plan_seed
join public.countries on countries.iso2 = plan_seed.iso2
on conflict (plan_id, country_id, network_name, network_type) do update
set coverage_note = excluded.coverage_note;

with plan_seed (id, usage_tier, data_amount_gb, is_unlimited) as (
  values
    ('44444444-4444-4444-8444-444444444111'::uuid, 'moderate', 10::numeric, false),
    ('44444444-4444-4444-8444-444444444112'::uuid, 'heavy', 20::numeric, false),
    ('44444444-4444-4444-8444-444444444113'::uuid, 'unlimited', null::numeric, true),
    ('44444444-4444-4444-8444-444444444121'::uuid, 'light', 3::numeric, false),
    ('44444444-4444-4444-8444-444444444122'::uuid, 'heavy', 20::numeric, false),
    ('44444444-4444-4444-8444-444444444123'::uuid, 'unlimited', null::numeric, true),
    ('44444444-4444-4444-8444-444444444131'::uuid, 'light', 3::numeric, false),
    ('44444444-4444-4444-8444-444444444132'::uuid, 'moderate', 10::numeric, false),
    ('44444444-4444-4444-8444-444444444133'::uuid, 'heavy', 20::numeric, false),
    ('44444444-4444-4444-8444-444444444134'::uuid, 'unlimited', null::numeric, true),
    ('44444444-4444-4444-8444-444444444141'::uuid, 'light', 3::numeric, false),
    ('44444444-4444-4444-8444-444444444142'::uuid, 'moderate', 10::numeric, false),
    ('44444444-4444-4444-8444-444444444143'::uuid, 'heavy', 20::numeric, false),
    ('44444444-4444-4444-8444-444444444144'::uuid, 'unlimited', null::numeric, true),
    ('44444444-4444-4444-8444-444444444151'::uuid, 'light', 3::numeric, false),
    ('44444444-4444-4444-8444-444444444152'::uuid, 'moderate', 10::numeric, false),
    ('44444444-4444-4444-8444-444444444153'::uuid, 'heavy', 20::numeric, false),
    ('44444444-4444-4444-8444-444444444154'::uuid, 'unlimited', null::numeric, true),
    ('44444444-4444-4444-8444-444444444161'::uuid, 'light', 3::numeric, false),
    ('44444444-4444-4444-8444-444444444171'::uuid, 'light', 3::numeric, false),
    ('44444444-4444-4444-8444-444444444181'::uuid, 'light', 3::numeric, false),
    ('44444444-4444-4444-8444-444444444191'::uuid, 'light', 3::numeric, false)
)
insert into public.plan_features (plan_id, icon, label, sort_order)
select plan_seed.id, feature.icon, feature.label, feature.sort_order
from plan_seed
cross join lateral (
  values
    ('zap', 'Instant QR activation', 1),
    ('wifi', 'Tethering supported', 2),
    (
      case when plan_seed.is_unlimited then 'infinity' else 'database' end,
      case
        when plan_seed.is_unlimited then 'Unlimited data'
        else trim(to_char(plan_seed.data_amount_gb, 'FM999999990.##')) || 'GB high-speed data'
      end,
      3
    )
) as feature (icon, label, sort_order)
on conflict (plan_id, label) do update
set icon = excluded.icon,
    sort_order = excluded.sort_order;
