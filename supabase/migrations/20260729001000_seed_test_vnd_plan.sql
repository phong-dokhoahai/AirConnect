-- Seed a low-value VND plan for SePay checkout testing.

insert into public.countries (id, name, iso2, iso3)
values ('11111111-1111-4111-8111-111111111113', 'Vietnam', 'VN', 'VNM')
on conflict (iso2) do update
set name = excluded.name,
    iso3 = excluded.iso3;

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
  usage_tier,
  original_price,
  discount_percent
)
values (
  '55555555-5555-4555-8555-555555555201',
  'Vietnam Test Plan',
  'A low-value Vietnam eSIM plan for SePay checkout testing.',
  1,
  false,
  1,
  2000,
  'VND',
  'AirConnect',
  'Validity starts when the eSIM first connects to a supported network in Vietnam.',
  true,
  false,
  true,
  'light',
  null,
  null
)
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
    usage_tier = excluded.usage_tier,
    original_price = excluded.original_price,
    discount_percent = excluded.discount_percent;

insert into public.plan_countries (plan_id, country_id)
select '55555555-5555-4555-8555-555555555201'::uuid, countries.id
from public.countries
where countries.iso2 = 'VN'
on conflict do nothing;

insert into public.plan_networks (
  plan_id,
  country_id,
  network_name,
  coverage_note,
  network_type
)
select
  '55555555-5555-4555-8555-555555555201'::uuid,
  countries.id,
  'Viettel',
  'Vietnam test plan access on Viettel.',
  '4G'
from public.countries
where countries.iso2 = 'VN'
on conflict (plan_id, country_id, network_name, network_type) do update
set coverage_note = excluded.coverage_note;

insert into public.plan_features (plan_id, icon, label, sort_order)
values
  ('55555555-5555-4555-8555-555555555201', 'zap', 'Instant QR activation', 1),
  ('55555555-5555-4555-8555-555555555201', 'wifi', 'Tethering supported', 2),
  ('55555555-5555-4555-8555-555555555201', 'database', '1GB high-speed data', 3)
on conflict (plan_id, label) do update
set icon = excluded.icon,
    sort_order = excluded.sort_order;
