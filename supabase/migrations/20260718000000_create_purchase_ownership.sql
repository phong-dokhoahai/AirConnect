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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.esim_plans (id) on delete restrict,
  status text not null default 'paid',
  traveler_full_name text not null,
  traveler_email text not null,
  payment_method text not null default 'demo',
  subtotal_amount numeric(10, 2) not null,
  discount_amount numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null,
  currency char(3) not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (status in ('paid', 'pending', 'failed', 'canceled')),
  constraint orders_amounts_non_negative check (
    subtotal_amount >= 0
    and discount_amount >= 0
    and tax_amount >= 0
    and total_amount >= 0
  ),
  constraint orders_currency_uppercase check (currency = upper(currency))
);

create table if not exists public.user_esims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  plan_id uuid not null references public.esim_plans (id) on delete restrict,
  status text not null default 'ready',
  data_used_gb numeric(8, 2) not null default 0,
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_esims_order_unique unique (order_id),
  constraint user_esims_status_check check (status in ('ready', 'active', 'expired')),
  constraint user_esims_data_used_non_negative check (data_used_gb >= 0)
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_plan_id_idx on public.orders (plan_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists user_esims_user_id_idx on public.user_esims (user_id);
create index if not exists user_esims_order_id_idx on public.user_esims (order_id);
create index if not exists user_esims_plan_id_idx on public.user_esims (plan_id);
create index if not exists user_esims_status_idx on public.user_esims (status);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_user_esims_updated_at on public.user_esims;
create trigger set_user_esims_updated_at
before update on public.user_esims
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.user_esims enable row level security;

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own orders" on public.orders;

drop policy if exists "Users can read own esims" on public.user_esims;
create policy "Users can read own esims"
on public.user_esims for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own esims" on public.user_esims;

create or replace function public.create_demo_purchase(
  p_plan_id uuid,
  p_traveler_full_name text,
  p_traveler_email text,
  p_payment_method text default 'demo',
  p_discount_amount numeric default 0,
  p_tax_amount numeric default 0
)
returns table (order_id uuid, user_esim_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan record;
  v_order_id uuid;
  v_user_esim_id uuid;
  v_discount_amount numeric(10, 2) := greatest(coalesce(p_discount_amount, 0), 0);
  v_tax_amount numeric(10, 2) := greatest(coalesce(p_tax_amount, 0), 0);
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if nullif(trim(p_traveler_full_name), '') is null
    or nullif(trim(p_traveler_email), '') is null then
    raise exception 'Traveler name and email are required';
  end if;

  select id, price, currency
  into v_plan
  from public.esim_plans
  where id = p_plan_id
    and is_active = true;

  if not found then
    raise exception 'Plan unavailable';
  end if;

  insert into public.orders (
    user_id,
    plan_id,
    status,
    traveler_full_name,
    traveler_email,
    payment_method,
    subtotal_amount,
    discount_amount,
    tax_amount,
    total_amount,
    currency
  )
  values (
    v_user_id,
    v_plan.id,
    'paid',
    trim(p_traveler_full_name),
    trim(p_traveler_email),
    coalesce(nullif(trim(p_payment_method), ''), 'demo'),
    v_plan.price,
    v_discount_amount,
    v_tax_amount,
    greatest(0, v_plan.price - v_discount_amount + v_tax_amount),
    v_plan.currency
  )
  returning id into v_order_id;

  insert into public.user_esims (
    user_id,
    order_id,
    plan_id,
    status
  )
  values (
    v_user_id,
    v_order_id,
    v_plan.id,
    'ready'
  )
  returning id into v_user_esim_id;

  return query select v_order_id, v_user_esim_id;
end;
$$;

revoke all on function public.create_demo_purchase(uuid, text, text, text, numeric, numeric) from public;
grant execute on function public.create_demo_purchase(uuid, text, text, text, numeric, numeric) to authenticated;
