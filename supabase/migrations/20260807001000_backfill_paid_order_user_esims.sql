insert into public.user_esims (
  user_id,
  order_id,
  plan_id,
  status
)
select
  orders.user_id,
  orders.id,
  orders.plan_id,
  'ready'
from public.orders
where orders.status = 'paid'
  and not exists (
    select 1
    from public.user_esims
    where user_esims.order_id = orders.id
  )
on conflict (order_id) do nothing;
