create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint admin_profiles_role_check check (role = 'admin')
);

alter table public.admin_profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
on public.admin_profiles for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage countries" on public.countries;
create policy "Admins can manage countries"
on public.countries for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage regions" on public.regions;
create policy "Admins can manage regions"
on public.regions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage region countries" on public.region_countries;
create policy "Admins can manage region countries"
on public.region_countries for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage esim plans" on public.esim_plans;
create policy "Admins can manage esim plans"
on public.esim_plans for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage plan countries" on public.plan_countries;
create policy "Admins can manage plan countries"
on public.plan_countries for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage plan regions" on public.plan_regions;
create policy "Admins can manage plan regions"
on public.plan_regions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage plan networks" on public.plan_networks;
create policy "Admins can manage plan networks"
on public.plan_networks for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage plan features" on public.plan_features;
create policy "Admins can manage plan features"
on public.plan_features for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read user esims" on public.user_esims;
create policy "Admins can read user esims"
on public.user_esims for select
to authenticated
using (public.is_admin());
