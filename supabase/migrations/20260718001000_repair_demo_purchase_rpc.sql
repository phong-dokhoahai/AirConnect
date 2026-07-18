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

notify pgrst, 'reload schema';
