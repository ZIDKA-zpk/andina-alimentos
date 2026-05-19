create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'seller');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'approved', 'rejected', 'cancelled');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  role public.user_role not null default 'seller',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  description text,
  image_url text,
  base_price numeric(10, 2) not null check (base_price >= 0),
  promo_price numeric(10, 2) check (promo_price is null or promo_price >= 0),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_promo_not_higher_than_base
    check (promo_price is null or promo_price <= base_price)
);

create table if not exists public.discount_rules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  min_qty integer not null check (min_qty > 0),
  discount_percent numeric(5, 2) not null check (
    discount_percent >= 0 and discount_percent <= 100
  ),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, min_qty)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  status public.order_status not null default 'pending',
  subtotal numeric(10, 2) not null default 0 check (subtotal >= 0),
  discount_total numeric(10, 2) not null default 0 check (discount_total >= 0),
  total numeric(10, 2) not null default 0 check (total >= 0),
  notes text,
  rejection_reason text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  product_sku text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  discount_percent numeric(5, 2) not null default 0 check (
    discount_percent >= 0 and discount_percent <= 100
  ),
  discount_amount numeric(10, 2) not null default 0 check (discount_amount >= 0),
  line_subtotal numeric(10, 2) not null check (line_subtotal >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists products_active_idx on public.products(is_active);
create index if not exists orders_seller_id_idx on public.orders(seller_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists discount_rules_product_id_idx on public.discount_rules(product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_discount_rules_updated_at on public.discount_rules;
create trigger set_discount_rules_updated_at
before update on public.discount_rules
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_active_seller()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'seller'
      and is_active = true
  );
$$;

create or replace function public.create_order(
  p_items jsonb,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
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
    join public.products product on product.id = grouped.product_id
    where product.stock_qty < grouped.quantity
  ) then
    raise exception 'No hay stock suficiente para uno o mas productos.';
  end if;

  insert into public.orders (seller_id, notes)
  values (auth.uid(), nullif(trim(p_notes), ''))
  returning id into new_order_id;

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
  item record;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede aprobar pedidos.';
  end if;

  if not exists (
    select 1
    from public.orders
    where id = p_order_id
      and status = 'pending'
    for update
  ) then
    raise exception 'El pedido no existe o ya fue procesado.';
  end if;

  for item in
    select product_id, product_name, quantity
    from public.order_items
    where order_items.order_id = p_order_id
  loop
    update public.products
    set stock_qty = stock_qty - item.quantity
    where id = item.product_id
      and stock_qty >= item.quantity;

    if not found then
      raise exception 'Stock insuficiente para %.', item.product_name;
    end if;
  end loop;

  update public.orders
  set
    status = 'approved',
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
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede rechazar pedidos.';
  end if;

  update public.orders
  set
    status = 'rejected',
    rejection_reason = nullif(trim(p_reason), '')
  where id = p_order_id
    and status = 'pending';

  if not found then
    raise exception 'El pedido no existe o ya fue procesado.';
  end if;

  return p_order_id;
end;
$$;

create or replace function public.cancel_order(p_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set status = 'cancelled'
  where id = p_order_id
    and seller_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'No puedes cancelar este pedido.';
  end if;

  return p_order_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.discount_rules enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_select_active_seller_or_admin" on public.products;
create policy "products_select_active_seller_or_admin"
on public.products
for select
to authenticated
using (public.is_admin() or (is_active = true and public.is_active_seller()));

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
on public.products
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
on public.products
for delete
to authenticated
using (public.is_admin());

drop policy if exists "discount_rules_select_active_seller_or_admin" on public.discount_rules;
create policy "discount_rules_select_active_seller_or_admin"
on public.discount_rules
for select
to authenticated
using (
  public.is_admin()
  or (
    active = true
    and public.is_active_seller()
    and exists (
      select 1
      from public.products product
      where product.id = discount_rules.product_id
        and product.is_active = true
    )
  )
);

drop policy if exists "discount_rules_admin_insert" on public.discount_rules;
create policy "discount_rules_admin_insert"
on public.discount_rules
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "discount_rules_admin_update" on public.discount_rules;
create policy "discount_rules_admin_update"
on public.discount_rules
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "discount_rules_admin_delete" on public.discount_rules;
create policy "discount_rules_admin_delete"
on public.discount_rules
for delete
to authenticated
using (public.is_admin());

drop policy if exists "orders_select_owner_or_admin" on public.orders;
create policy "orders_select_owner_or_admin"
on public.orders
for select
to authenticated
using (seller_id = auth.uid() or public.is_admin());

drop policy if exists "order_items_select_owner_or_admin" on public.order_items;
create policy "order_items_select_owner_or_admin"
on public.order_items
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders order_row
    where order_row.id = order_items.order_id
      and order_row.seller_id = auth.uid()
  )
);

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select on public.products to authenticated;
grant select on public.discount_rules to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.discount_rules to authenticated;
grant update on public.profiles to authenticated;
grant execute on function public.create_order(jsonb, text) to authenticated;
grant execute on function public.approve_order(uuid) to authenticated;
grant execute on function public.reject_order(uuid, text) to authenticated;
grant execute on function public.cancel_order(uuid) to authenticated;

insert into public.products (name, sku, description, base_price, promo_price, stock_qty, is_active)
values
  ('Bolo fruta', 'BOLO-FRUTA', 'Producto congelado por unidad.', 1.50, 1.35, 1000, true),
  ('Bolo leche', 'BOLO-LECHE', 'Producto congelado por unidad.', 2.00, 1.80, 1000, true),
  ('Helado cono', 'HELADO-CONO', 'Helado en cono para venta directa.', 3.50, null, 500, true),
  ('Sandwich', 'SANDWICH', 'Sandwich congelado listo para distribucion.', 4.00, null, 300, true)
on conflict (sku) do update
set
  name = excluded.name,
  description = excluded.description,
  base_price = excluded.base_price,
  promo_price = excluded.promo_price,
  stock_qty = greatest(public.products.stock_qty, excluded.stock_qty),
  is_active = excluded.is_active;

insert into public.discount_rules (product_id, min_qty, discount_percent, active)
select id, 24, 5, true
from public.products
where sku in ('BOLO-FRUTA', 'BOLO-LECHE', 'HELADO-CONO', 'SANDWICH')
on conflict (product_id, min_qty) do update
set discount_percent = excluded.discount_percent, active = excluded.active;

insert into public.discount_rules (product_id, min_qty, discount_percent, active)
select id, 48, 10, true
from public.products
where sku in ('BOLO-FRUTA', 'BOLO-LECHE', 'HELADO-CONO', 'SANDWICH')
on conflict (product_id, min_qty) do update
set discount_percent = excluded.discount_percent, active = excluded.active;
