alter table public.orders
  add column if not exists payment_provider text not null default 'demo',
  add column if not exists provider_payment_id text,
  add column if not exists payment_metadata jsonb not null default '{}'::jsonb,
  add column if not exists paid_at timestamptz;

create unique index if not exists orders_provider_payment_unique
on public.orders (payment_provider, provider_payment_id)
where provider_payment_id is not null;

create or replace function public.create_pending_payment_order(
  p_plan_id uuid,
  p_traveler_full_name text,
  p_traveler_email text,
  p_payment_provider text,
  p_discount_amount numeric default 0,
  p_tax_amount numeric default 0,
  p_payment_metadata jsonb default '{}'::jsonb
)
returns table (
  order_id uuid,
  total_amount numeric,
  currency char(3),
  payment_code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan record;
  v_order_id uuid;
  v_payment_code text;
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

  if p_payment_provider not in ('stripe', 'sepay') then
    raise exception 'Unsupported payment provider';
  end if;

  select ep.id, ep.price, ep.currency
  into v_plan
  from public.esim_plans ep
  where ep.id = p_plan_id
    and ep.is_active = true;

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
    payment_provider,
    subtotal_amount,
    discount_amount,
    tax_amount,
    total_amount,
    currency,
    payment_metadata
  )
  values (
    v_user_id,
    v_plan.id,
    'pending',
    trim(p_traveler_full_name),
    trim(p_traveler_email),
    p_payment_provider,
    p_payment_provider,
    v_plan.price,
    v_discount_amount,
    v_tax_amount,
    greatest(0, v_plan.price - v_discount_amount + v_tax_amount),
    v_plan.currency,
    coalesce(p_payment_metadata, '{}'::jsonb)
  )
  returning id into v_order_id;

  v_payment_code := 'AC' || upper(substr(replace(v_order_id::text, '-', ''), 1, 12));

  update public.orders
  set provider_payment_id = v_payment_code
  where id = v_order_id;

  return query
  select
    v_order_id,
    greatest(0, v_plan.price - v_discount_amount + v_tax_amount),
    v_plan.currency,
    v_payment_code;
end;
$$;

revoke all on function public.create_pending_payment_order(uuid, text, text, text, numeric, numeric, jsonb) from public;
grant execute on function public.create_pending_payment_order(uuid, text, text, text, numeric, numeric, jsonb) to authenticated;

notify pgrst, 'reload schema';
