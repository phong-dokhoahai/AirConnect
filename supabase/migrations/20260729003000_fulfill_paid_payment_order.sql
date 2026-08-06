create or replace function public.fulfill_paid_payment_order(p_order_id uuid)
returns table (order_id uuid, user_esim_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_user_esim_id uuid;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.status <> 'paid' then
    raise exception 'Order is not paid';
  end if;

  insert into public.user_esims (
    user_id,
    order_id,
    plan_id,
    status
  )
  values (
    v_order.user_id,
    v_order.id,
    v_order.plan_id,
    'ready'
  )
  on conflict (order_id) do nothing;

  select id
  into v_user_esim_id
  from public.user_esims
  where order_id = v_order.id;

  return query select v_order.id, v_user_esim_id;
end;
$$;

revoke all on function public.fulfill_paid_payment_order(uuid) from public;
grant execute on function public.fulfill_paid_payment_order(uuid) to service_role;

notify pgrst, 'reload schema';
