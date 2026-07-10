-- Product Catalog schema for AirConnect eSIM marketplace.
-- Safe to run in the Supabase SQL Editor on a new project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  iso2 char(2) not null,
  iso3 char(3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint countries_iso2_unique unique (iso2),
  constraint countries_iso2_uppercase check (iso2 = upper(iso2)),
  constraint countries_iso3_uppercase check (iso3 is null or iso3 = upper(iso3))
);

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint regions_slug_unique unique (slug),
  constraint regions_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.region_countries (
  region_id uuid not null references public.regions (id) on delete cascade,
  country_id uuid not null references public.countries (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (region_id, country_id)
);

create table if not exists public.esim_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  data_amount_gb numeric(8, 2),
  is_unlimited boolean not null default false,
  validity_days integer not null,
  price numeric(10, 2) not null,
  currency char(3) not null default 'USD',
  provider_name text not null,
  activation_policy text not null,
  tethering_supported boolean not null default true,
  supports_5g boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint esim_plans_data_amount_required check (
    (is_unlimited = true and data_amount_gb is null)
    or (is_unlimited = false and data_amount_gb is not null and data_amount_gb > 0)
  ),
  constraint esim_plans_validity_positive check (validity_days > 0),
  constraint esim_plans_price_non_negative check (price >= 0),
  constraint esim_plans_currency_uppercase check (currency = upper(currency))
);

create table if not exists public.plan_countries (
  plan_id uuid not null references public.esim_plans (id) on delete cascade,
  country_id uuid not null references public.countries (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plan_id, country_id)
);

create table if not exists public.plan_regions (
  plan_id uuid not null references public.esim_plans (id) on delete cascade,
  region_id uuid not null references public.regions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plan_id, region_id)
);

create table if not exists public.plan_networks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.esim_plans (id) on delete cascade,
  country_id uuid not null references public.countries (id) on delete cascade,
  network_name text not null,
  coverage_note text,
  network_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_networks_type_check check (network_type in ('4G', '5G', 'LTE')),
  constraint plan_networks_unique unique (plan_id, country_id, network_name, network_type)
);

create table if not exists public.plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.esim_plans (id) on delete cascade,
  icon text not null,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_features_unique unique (plan_id, label)
);

create index if not exists countries_iso2_idx on public.countries (iso2);
create index if not exists regions_slug_idx on public.regions (slug);
create index if not exists region_countries_region_id_idx on public.region_countries (region_id);
create index if not exists region_countries_country_id_idx on public.region_countries (country_id);
create index if not exists esim_plans_is_active_idx on public.esim_plans (is_active);
create index if not exists esim_plans_price_idx on public.esim_plans (price);
create index if not exists esim_plans_validity_days_idx on public.esim_plans (validity_days);
create index if not exists esim_plans_data_amount_gb_idx on public.esim_plans (data_amount_gb);
create index if not exists plan_countries_plan_id_idx on public.plan_countries (plan_id);
create index if not exists plan_countries_country_id_idx on public.plan_countries (country_id);
create index if not exists plan_regions_plan_id_idx on public.plan_regions (plan_id);
create index if not exists plan_regions_region_id_idx on public.plan_regions (region_id);
create index if not exists plan_networks_plan_id_idx on public.plan_networks (plan_id);
create index if not exists plan_networks_country_id_idx on public.plan_networks (country_id);
create index if not exists plan_features_plan_id_idx on public.plan_features (plan_id);

drop trigger if exists set_countries_updated_at on public.countries;
create trigger set_countries_updated_at
before update on public.countries
for each row execute function public.set_updated_at();

drop trigger if exists set_regions_updated_at on public.regions;
create trigger set_regions_updated_at
before update on public.regions
for each row execute function public.set_updated_at();

drop trigger if exists set_esim_plans_updated_at on public.esim_plans;
create trigger set_esim_plans_updated_at
before update on public.esim_plans
for each row execute function public.set_updated_at();

drop trigger if exists set_plan_networks_updated_at on public.plan_networks;
create trigger set_plan_networks_updated_at
before update on public.plan_networks
for each row execute function public.set_updated_at();

drop trigger if exists set_plan_features_updated_at on public.plan_features;
create trigger set_plan_features_updated_at
before update on public.plan_features
for each row execute function public.set_updated_at();

alter table public.countries enable row level security;
alter table public.regions enable row level security;
alter table public.region_countries enable row level security;
alter table public.esim_plans enable row level security;
alter table public.plan_countries enable row level security;
alter table public.plan_regions enable row level security;
alter table public.plan_networks enable row level security;
alter table public.plan_features enable row level security;

drop policy if exists "Public can read countries" on public.countries;
create policy "Public can read countries"
on public.countries for select
to anon, authenticated
using (true);

drop policy if exists "Public can read regions" on public.regions;
create policy "Public can read regions"
on public.regions for select
to anon, authenticated
using (true);

drop policy if exists "Public can read region countries" on public.region_countries;
create policy "Public can read region countries"
on public.region_countries for select
to anon, authenticated
using (true);

drop policy if exists "Public can read active plans" on public.esim_plans;
create policy "Public can read active plans"
on public.esim_plans for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active plan countries" on public.plan_countries;
create policy "Public can read active plan countries"
on public.plan_countries for select
to anon, authenticated
using (
  exists (
    select 1
    from public.esim_plans
    where esim_plans.id = plan_countries.plan_id
      and esim_plans.is_active = true
  )
);

drop policy if exists "Public can read active plan regions" on public.plan_regions;
create policy "Public can read active plan regions"
on public.plan_regions for select
to anon, authenticated
using (
  exists (
    select 1
    from public.esim_plans
    where esim_plans.id = plan_regions.plan_id
      and esim_plans.is_active = true
  )
);

drop policy if exists "Public can read active plan networks" on public.plan_networks;
create policy "Public can read active plan networks"
on public.plan_networks for select
to anon, authenticated
using (
  exists (
    select 1
    from public.esim_plans
    where esim_plans.id = plan_networks.plan_id
      and esim_plans.is_active = true
  )
);

drop policy if exists "Public can read active plan features" on public.plan_features;
create policy "Public can read active plan features"
on public.plan_features for select
to anon, authenticated
using (
  exists (
    select 1
    from public.esim_plans
    where esim_plans.id = plan_features.plan_id
      and esim_plans.is_active = true
  )
);

insert into public.countries (id, name, iso2, iso3)
values
  ('11111111-1111-4111-8111-111111111111', 'Japan', 'JP', 'JPN'),
  ('11111111-1111-4111-8111-111111111112', 'Thailand', 'TH', 'THA'),
  ('11111111-1111-4111-8111-111111111113', 'Vietnam', 'VN', 'VNM'),
  ('11111111-1111-4111-8111-111111111114', 'Singapore', 'SG', 'SGP'),
  ('11111111-1111-4111-8111-111111111115', 'South Korea', 'KR', 'KOR'),
  ('11111111-1111-4111-8111-111111111116', 'United States', 'US', 'USA'),
  ('11111111-1111-4111-8111-111111111117', 'France', 'FR', 'FRA'),
  ('11111111-1111-4111-8111-111111111118', 'Spain', 'ES', 'ESP'),
  ('11111111-1111-4111-8111-111111111119', 'Italy', 'IT', 'ITA')
on conflict (iso2) do update
set name = excluded.name,
    iso3 = excluded.iso3;

insert into public.regions (id, name, slug, description)
values
  ('22222222-2222-4222-8222-222222222221', 'Asia', 'asia', 'Regional eSIM plans for popular Asian destinations.'),
  ('22222222-2222-4222-8222-222222222222', 'Europe', 'europe', 'Regional eSIM plans for European travel.'),
  ('22222222-2222-4222-8222-222222222223', 'Global', 'global', 'Multi-region eSIM plans for international trips.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

insert into public.region_countries (region_id, country_id)
values
  ('22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111112'),
  ('22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111113'),
  ('22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111114'),
  ('22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111115'),
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111117'),
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111118'),
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111119'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111112'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111113'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111114'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111115'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111116'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111117'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111118'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111119')
on conflict do nothing;

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
  is_active
)
values
  (
    '33333333-3333-4333-8333-333333333331',
    'Japan 5GB / 7 Days',
    'A compact Japan data plan for short city breaks and business trips.',
    5,
    false,
    7,
    8.99,
    'USD',
    'AirConnect',
    'Validity starts when the eSIM first connects to a supported network in Japan.',
    true,
    true,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    'Thailand 10GB / 15 Days',
    'Reliable Thailand coverage for holidays, remote work, and navigation.',
    10,
    false,
    15,
    12.99,
    'USD',
    'AirConnect',
    'Validity starts on first network connection in Thailand.',
    true,
    true,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Asia Unlimited / 30 Days',
    'Unlimited regional data for frequent travel across supported Asian countries.',
    null,
    true,
    30,
    39.99,
    'USD',
    'AirConnect',
    'Validity starts when the eSIM first connects in any supported Asia destination.',
    true,
    true,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333334',
    'Europe 20GB / 30 Days',
    'A multi-country Europe plan for maps, messaging, and travel apps.',
    20,
    false,
    30,
    29.99,
    'USD',
    'AirConnect',
    'Validity starts on first connection in a supported European country.',
    true,
    true,
    true
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
    is_active = excluded.is_active;

insert into public.plan_countries (plan_id, country_id)
values
  ('33333333-3333-4333-8333-333333333331', '11111111-1111-4111-8111-111111111111'),
  ('33333333-3333-4333-8333-333333333332', '11111111-1111-4111-8111-111111111112')
on conflict do nothing;

insert into public.plan_regions (plan_id, region_id)
values
  ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222221'),
  ('33333333-3333-4333-8333-333333333334', '22222222-2222-4222-8222-222222222222')
on conflict do nothing;

insert into public.plan_networks (plan_id, country_id, network_name, coverage_note, network_type)
values
  ('33333333-3333-4333-8333-333333333331', '11111111-1111-4111-8111-111111111111', 'NTT Docomo', 'Strong urban and rail coverage across Japan.', '5G'),
  ('33333333-3333-4333-8333-333333333331', '11111111-1111-4111-8111-111111111111', 'SoftBank', 'Backup LTE coverage in supported areas.', 'LTE'),
  ('33333333-3333-4333-8333-333333333332', '11111111-1111-4111-8111-111111111112', 'AIS', 'Broad coverage in Bangkok, islands, and major tourist routes.', '5G'),
  ('33333333-3333-4333-8333-333333333332', '11111111-1111-4111-8111-111111111112', 'TrueMove H', 'Additional LTE coverage in supported areas.', 'LTE'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'NTT Docomo', 'Japan access on the Asia regional plan.', '5G'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111112', 'AIS', 'Thailand access on the Asia regional plan.', '5G'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111113', 'Viettel', 'Vietnam access on the Asia regional plan.', '4G'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111114', 'Singtel', 'Singapore access on the Asia regional plan.', '5G'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111115', 'SK Telecom', 'South Korea access on the Asia regional plan.', '5G'),
  ('33333333-3333-4333-8333-333333333334', '11111111-1111-4111-8111-111111111117', 'Orange France', 'France access on the Europe regional plan.', '5G'),
  ('33333333-3333-4333-8333-333333333334', '11111111-1111-4111-8111-111111111118', 'Movistar', 'Spain access on the Europe regional plan.', '5G'),
  ('33333333-3333-4333-8333-333333333334', '11111111-1111-4111-8111-111111111119', 'TIM', 'Italy access on the Europe regional plan.', '5G')
on conflict (plan_id, country_id, network_name, network_type) do update
set coverage_note = excluded.coverage_note;

insert into public.plan_features (plan_id, icon, label, sort_order)
values
  ('33333333-3333-4333-8333-333333333331', 'zap', 'Instant QR activation', 1),
  ('33333333-3333-4333-8333-333333333331', 'wifi', 'Tethering supported', 2),
  ('33333333-3333-4333-8333-333333333331', 'badge-5g', '5G supported', 3),
  ('33333333-3333-4333-8333-333333333332', 'zap', 'Instant QR activation', 1),
  ('33333333-3333-4333-8333-333333333332', 'map', 'Great tourist coverage', 2),
  ('33333333-3333-4333-8333-333333333332', 'wifi', 'Hotspot available', 3),
  ('33333333-3333-4333-8333-333333333333', 'infinity', 'Unlimited data', 1),
  ('33333333-3333-4333-8333-333333333333', 'globe', 'Works across Asia', 2),
  ('33333333-3333-4333-8333-333333333333', 'badge-5g', '5G in supported cities', 3),
  ('33333333-3333-4333-8333-333333333334', 'database', '20GB high-speed data', 1),
  ('33333333-3333-4333-8333-333333333334', 'globe', 'Multi-country Europe coverage', 2),
  ('33333333-3333-4333-8333-333333333334', 'wifi', 'Tethering supported', 3)
on conflict (plan_id, label) do update
set icon = excluded.icon,
    sort_order = excluded.sort_order;
