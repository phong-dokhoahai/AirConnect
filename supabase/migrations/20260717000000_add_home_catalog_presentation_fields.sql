-- Home catalog presentation fields.

alter table public.countries
add column if not exists display_emoji text;

alter table public.regions
add column if not exists display_icon text,
add column if not exists gradient_start text,
add column if not exists gradient_end text;

alter table public.esim_plans
add column if not exists original_price numeric(10, 2),
add column if not exists discount_percent integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'esim_plans_original_price_non_negative'
  ) then
    alter table public.esim_plans
    add constraint esim_plans_original_price_non_negative
    check (original_price is null or original_price >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'esim_plans_discount_percent_range'
  ) then
    alter table public.esim_plans
    add constraint esim_plans_discount_percent_range
    check (discount_percent is null or discount_percent between 0 and 100);
  end if;
end;
$$;

update public.countries
set display_emoji = country_seed.display_emoji
from (
  values
    ('JP', '🏯'),
    ('TH', '🏝️'),
    ('VN', '🌾'),
    ('SG', '🌃'),
    ('KR', '🏙️'),
    ('US', '🗽'),
    ('FR', '🗼'),
    ('ES', '🏖️'),
    ('IT', '🏰')
) as country_seed (iso2, display_emoji)
where countries.iso2 = country_seed.iso2;

update public.regions
set display_icon = region_seed.display_icon,
    gradient_start = region_seed.gradient_start,
    gradient_end = region_seed.gradient_end
from (
  values
    ('asia', '🌏', '#FB923C', '#EC4899'),
    ('europe', '🏰', '#60A5FA', '#8B5CF6'),
    ('global', '🌍', '#A78BFA', '#EC4899')
) as region_seed (slug, display_icon, gradient_start, gradient_end)
where regions.slug = region_seed.slug;

update public.esim_plans
set original_price = round(price * 1.25, 2),
    discount_percent = 20
where original_price is null
  and discount_percent is null
  and price > 0;
