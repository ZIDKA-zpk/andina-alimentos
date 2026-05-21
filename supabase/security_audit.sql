select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace
  and relkind = 'r'
  and relname in (
    'profiles',
    'products',
    'discount_rules',
    'orders',
    'order_items'
  )
order by relname;

select
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'profiles',
    'products',
    'discount_rules',
    'orders',
    'order_items'
  )
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

select
  routine_name,
  security_type
from information_schema.routines
where specific_schema = 'public'
  and routine_name in (
    'create_order',
    'approve_order',
    'reject_order',
    'cancel_order',
    'is_admin',
    'is_active_seller',
    'current_user_role'
  )
order by routine_name;
