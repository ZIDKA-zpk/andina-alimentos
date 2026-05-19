select
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'products',
    'discount_rules',
    'orders',
    'order_items'
  )
order by table_name;

select sku, name, base_price, promo_price, stock_qty, is_active
from public.products
order by sku;

select
  product.sku,
  rule.min_qty,
  rule.discount_percent,
  rule.active
from public.discount_rules rule
join public.products product on product.id = rule.product_id
order by product.sku, rule.min_qty;
