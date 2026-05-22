create extension if not exists pgcrypto;

alter table public.orders
add column if not exists idempotency_key uuid,
add column if not exists request_hash text,
add column if not exists stock_reserved boolean not null default false;

create unique index if not exists orders_seller_idempotency_key_uidx
on public.orders(seller_id, idempotency_key)
where idempotency_key is not null;

create unique index if not exists orders_seller_pending_request_hash_uidx
on public.orders(seller_id, request_hash)
where status = 'pending' and request_hash is not null;

drop function if exists public.create_order(jsonb, text);

create or replace function public.create_order(
  p_items jsonb,
  p_notes text default null,
  p_idempotency_key uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_order_id uuid;
  order_item record;
  new_order_id uuid;
  v_idempotency_key uuid := coalesce(p_idempotency_key, gen_random_uuid());
  v_request_hash text;
  v_stock_available integer;
  v_stock_product_name text;
  v_stock_requested integer;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion.';
  end if;

  if not public.is_active_seller() then
    raise exception 'Tu cuenta de vendedor aun no esta activa.';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido debe tener al menos un producto.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item
    where (item->>'product_id') is null
       or (item->>'quantity') is null
       or (item->>'quantity')::integer <= 0
  ) then
    raise exception 'El pedido contiene productos invalidos.';
  end if;

  if exists (
    with grouped_items as (
      select
        (item->>'product_id')::uuid as product_id,
        sum((item->>'quantity')::integer) as quantity
      from jsonb_array_elements(p_items) as item
      group by (item->>'product_id')::uuid
    )
    select 1
    from grouped_items grouped
    left join public.products product on product.id = grouped.product_id
    where product.id is null or product.is_active = false
  ) then
    raise exception 'Uno o mas productos no existen o no estan activos.';
  end if;

  select
    product.name,
    product.stock_qty,
    grouped.quantity
  into
    v_stock_product_name,
    v_stock_available,
    v_stock_requested
  from (
    select
      (item->>'product_id')::uuid as product_id,
      sum((item->>'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) as item
    group by (item->>'product_id')::uuid
  ) grouped
  join public.products product on product.id = grouped.product_id
  where product.stock_qty < grouped.quantity
  order by product.name
  limit 1;

  if v_stock_product_name is not null then
    raise exception 'Stock insuficiente para %. Disponible: %, solicitado: %.',
      v_stock_product_name,
      v_stock_available,
      v_stock_requested;
  end if;

  select md5(
    coalesce(nullif(trim(p_notes), ''), '') || '|' || string_agg(
      grouped.product_id::text || ':' || grouped.quantity::text,
      ',' order by grouped.product_id
    )
  )
  into v_request_hash
  from (
    select
      (item->>'product_id')::uuid as product_id,
      sum((item->>'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) as item
    group by (item->>'product_id')::uuid
  ) grouped;

  select id
  into existing_order_id
  from public.orders
  where seller_id = auth.uid()
    and idempotency_key = v_idempotency_key
  limit 1;

  if existing_order_id is not null then
    return existing_order_id;
  end if;

  select id
  into existing_order_id
  from public.orders
  where seller_id = auth.uid()
    and status = 'pending'
    and request_hash = v_request_hash
  order by created_at desc
  limit 1;

  if existing_order_id is not null then
    return existing_order_id;
  end if;

  begin
    insert into public.orders (
      seller_id,
      notes,
      idempotency_key,
      request_hash
    )
    values (
      auth.uid(),
      nullif(trim(p_notes), ''),
      v_idempotency_key,
      v_request_hash
    )
    returning id into new_order_id;
  exception when unique_violation then
    select id
    into existing_order_id
    from public.orders
    where seller_id = auth.uid()
      and (
        idempotency_key = v_idempotency_key
        or (status = 'pending' and request_hash = v_request_hash)
      )
    order by created_at desc
    limit 1;

    if existing_order_id is not null then
      return existing_order_id;
    end if;

    raise;
  end;

  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    product_sku,
    quantity,
    unit_price,
    discount_percent,
    discount_amount,
    line_subtotal,
    line_total
  )
  with grouped_items as (
    select
      (item->>'product_id')::uuid as product_id,
      sum((item->>'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) as item
    group by (item->>'product_id')::uuid
  ),
  priced_items as (
    select
      grouped.product_id,
      product.name,
      product.sku,
      grouped.quantity,
      coalesce(product.promo_price, product.base_price) as unit_price,
      coalesce((
        select max(rule.discount_percent)
        from public.discount_rules rule
        where rule.product_id = grouped.product_id
          and rule.active = true
          and rule.min_qty <= grouped.quantity
      ), 0) as discount_percent
    from grouped_items grouped
    join public.products product on product.id = grouped.product_id
  )
  select
    new_order_id,
    priced.product_id,
    priced.name,
    priced.sku,
    priced.quantity,
    priced.unit_price,
    priced.discount_percent,
    round((priced.quantity * priced.unit_price) * (priced.discount_percent / 100), 2),
    round(priced.quantity * priced.unit_price, 2),
    round((priced.quantity * priced.unit_price) * (1 - priced.discount_percent / 100), 2)
  from priced_items priced;

  update public.orders
  set
    subtotal = totals.subtotal,
    discount_total = totals.discount_total,
    total = totals.total
  from (
    select
      order_id,
      sum(line_subtotal) as subtotal,
      sum(discount_amount) as discount_total,
      sum(line_total) as total
    from public.order_items
    where order_id = new_order_id
    group by order_id
  ) totals
  where public.orders.id = totals.order_id;

  for order_item in
    select product_id, product_name, quantity
    from public.order_items
    where order_items.order_id = new_order_id
  loop
    update public.products
    set stock_qty = stock_qty - order_item.quantity
    where id = order_item.product_id
      and stock_qty >= order_item.quantity;

    if not found then
      select stock_qty
      into v_stock_available
      from public.products
      where id = order_item.product_id;

      raise exception 'Stock insuficiente para %. Disponible: %, solicitado: %.',
        order_item.product_name,
        coalesce(v_stock_available, 0),
        order_item.quantity;
    end if;
  end loop;

  update public.orders
  set stock_reserved = true
  where id = new_order_id;

  return new_order_id;
end;
$$;

create or replace function public.approve_order(p_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  order_item record;
  v_available_qty integer;
  v_stock_reserved boolean;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede aprobar pedidos.';
  end if;

  select stock_reserved
  into v_stock_reserved
  from public.orders
  where id = p_order_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'El pedido no existe o ya fue procesado.';
  end if;

  if not v_stock_reserved then
    for order_item in
      select product_id, product_name, quantity
      from public.order_items
      where order_items.order_id = p_order_id
    loop
      update public.products
      set stock_qty = stock_qty - order_item.quantity
      where id = order_item.product_id
        and stock_qty >= order_item.quantity;

      if not found then
        select stock_qty
        into v_available_qty
        from public.products
        where id = order_item.product_id;

        raise exception 'Stock insuficiente para %. Disponible: %, solicitado: %.',
          order_item.product_name,
          coalesce(v_available_qty, 0),
          order_item.quantity;
      end if;
    end loop;
  end if;

  update public.orders
  set
    status = 'approved',
    stock_reserved = true,
    approved_by = auth.uid(),
    approved_at = now()
  where id = p_order_id;

  return p_order_id;
end;
$$;

create or replace function public.reject_order(
  p_order_id uuid,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  order_item record;
  v_stock_reserved boolean;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede rechazar pedidos.';
  end if;

  select stock_reserved
  into v_stock_reserved
  from public.orders
  where id = p_order_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'El pedido no existe o ya fue procesado.';
  end if;

  if v_stock_reserved then
    for order_item in
      select product_id, quantity
      from public.order_items
      where order_items.order_id = p_order_id
    loop
      update public.products
      set stock_qty = stock_qty + order_item.quantity
      where id = order_item.product_id;
    end loop;
  end if;

  update public.orders
  set
    status = 'rejected',
    stock_reserved = false,
    rejection_reason = nullif(trim(p_reason), '')
  where id = p_order_id;

  return p_order_id;
end;
$$;

create or replace function public.cancel_order(p_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  order_item record;
  v_stock_reserved boolean;
begin
  select stock_reserved
  into v_stock_reserved
  from public.orders
  where id = p_order_id
    and seller_id = auth.uid()
    and status = 'pending'
  for update;

  if not found then
    raise exception 'No puedes cancelar este pedido.';
  end if;

  if v_stock_reserved then
    for order_item in
      select product_id, quantity
      from public.order_items
      where order_items.order_id = p_order_id
    loop
      update public.products
      set stock_qty = stock_qty + order_item.quantity
      where id = order_item.product_id;
    end loop;
  end if;

  update public.orders
  set
    status = 'cancelled',
    stock_reserved = false
  where id = p_order_id;

  return p_order_id;
end;
$$;

grant execute on function public.create_order(jsonb, text, uuid) to authenticated;
grant execute on function public.approve_order(uuid) to authenticated;
grant execute on function public.reject_order(uuid, text) to authenticated;
grant execute on function public.cancel_order(uuid) to authenticated;
