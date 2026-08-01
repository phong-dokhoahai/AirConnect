-- Seed Argentina catalog data and country-specific eSIM plans.

insert into public.countries (id, name, iso2, iso3)
values ('11111111-1111-4111-8111-111111111120', 'Argentina', 'AR', 'ARG')
on conflict (iso2) do update
set name = excluded.name,
    iso3 = excluded.iso3;

insert into public.region_countries (region_id, country_id)
select regions.id, countries.id
from public.regions
join public.countries on countries.iso2 = 'AR'
where regions.slug = 'global'
on conflict do nothing;

update public.countries
set display_emoji = U&'\+01F3D4\FE0F'
where iso2 = 'AR';

with plan_seed (
  id,
  usage_tier,
  data_amount_gb,
  is_unlimited,
  validity_days,
  price
) as (
  values
    ('44444444-4444-4444-8444-444444444201'::uuid, 'light', 3::numeric, false, 7, 6.99::numeric),
    ('44444444-4444-4444-8444-444444444202'::uuid, 'moderate', 10::numeric, false, 15, 14.99::numeric),
    ('44444444-4444-4444-8444-444444444203'::uuid, 'heavy', 20::numeric, false, 30, 26.99::numeric),
    ('44444444-4444-4444-8444-444444444204'::uuid, 'unlimited', null::numeric, true, 30, 42.99::numeric)
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
  'Argentina ' ||
    case usage_tier
      when 'light' then 'Light'
      when 'moderate' then 'Moderate'
      when 'heavy' then 'Heavy'
      else 'Unlimited'
    end,
  case usage_tier
    when 'light' then 'A light eSIM plan for maps, messaging, and short trips in Argentina.'
    when 'moderate' then 'A balanced eSIM plan for social media, browsing, and navigation in Argentina.'
    when 'heavy' then 'A high-data eSIM plan for streaming, calls, and longer stays in Argentina.'
    else 'An unlimited eSIM plan for maximum flexibility in Argentina.'
  end,
  data_amount_gb,
  is_unlimited,
  validity_days,
  price,
  'USD',
  'AirConnect',
  'Validity starts when the eSIM first connects to a supported network in Argentina.',
  true,
  true,
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
    is_active = public.esim_plans.is_active,
    usage_tier = excluded.usage_tier;

with plan_seed (id) as (
  values
    ('44444444-4444-4444-8444-444444444201'::uuid),
    ('44444444-4444-4444-8444-444444444202'::uuid),
    ('44444444-4444-4444-8444-444444444203'::uuid),
    ('44444444-4444-4444-8444-444444444204'::uuid)
)
insert into public.plan_countries (plan_id, country_id)
select plan_seed.id, countries.id
from plan_seed
join public.countries on countries.iso2 = 'AR'
on conflict do nothing;

with plan_seed (id, usage_tier, data_amount_gb, is_unlimited) as (
  values
    ('44444444-4444-4444-8444-444444444201'::uuid, 'light', 3::numeric, false),
    ('44444444-4444-4444-8444-444444444202'::uuid, 'moderate', 10::numeric, false),
    ('44444444-4444-4444-8444-444444444203'::uuid, 'heavy', 20::numeric, false),
    ('44444444-4444-4444-8444-444444444204'::uuid, 'unlimited', null::numeric, true)
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
  'Movistar Argentina',
  'Argentina ' || usage_tier || ' plan access on Movistar Argentina.',
  '5G'
from plan_seed
join public.countries on countries.iso2 = 'AR'
on conflict (plan_id, country_id, network_name, network_type) do update
set coverage_note = excluded.coverage_note;

with plan_seed (id, data_amount_gb, is_unlimited) as (
  values
    ('44444444-4444-4444-8444-444444444201'::uuid, 3::numeric, false),
    ('44444444-4444-4444-8444-444444444202'::uuid, 10::numeric, false),
    ('44444444-4444-4444-8444-444444444203'::uuid, 20::numeric, false),
    ('44444444-4444-4444-8444-444444444204'::uuid, null::numeric, true)
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

update public.esim_plans
set original_price = round(price * 1.25, 2),
    discount_percent = 20
where id in (
  '44444444-4444-4444-8444-444444444201',
  '44444444-4444-4444-8444-444444444202',
  '44444444-4444-4444-8444-444444444203',
  '44444444-4444-4444-8444-444444444204'
)
  and original_price is null
  and discount_percent is null;
