# Seguridad y operacion minima

## Capas de seguridad del MVP

La seguridad no depende de una sola capa.

```txt
Next.js Proxy
  protege rutas sin sesion

Layouts por rol
  separan vendedor y administrador

Server Actions
  validan formularios y roles antes de escribir

Supabase RLS
  limita filas visibles/editables por usuario

Funciones SQL
  calculan pedidos, descuentos, aprobacion y stock
```

## Configuracion recomendada en Supabase

En `Authentication > Providers > Email`:

- Desactiva registro publico si los vendedores se crean manualmente.
- Manten confirmacion de email activada para produccion.
- Usa contrasenas temporales solo para pruebas.

En `Authentication > URL Configuration`:

- `Site URL`: dominio final de Vercel o dominio propio.
- `Redirect URLs`: solo localhost y dominios reales.
- No uses comodines amplios en produccion.

En `Database > Tables`:

- Confirma RLS activo en `profiles`, `products`, `discount_rules`, `orders`, `order_items`.

En `Project Settings > API Keys`:

- En Vercel usa solo `NEXT_PUBLIC_SUPABASE_URL`.
- En Vercel usa solo `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- No pongas `service_role` en variables publicas ni en codigo frontend.

## Checks manuales antes de vender

Ejecutar en Supabase SQL Editor:

```txt
supabase/security_audit.sql
```

Resultado esperado:

- Las 5 tablas principales tienen `rls_enabled = true`.
- Existen policies para perfiles, productos, descuentos, pedidos e items.
- `anon` no debe tener permisos sobre tablas del negocio.
- Las funciones criticas aparecen como `DEFINER`.

## Pruebas de seguridad

1. Sin sesion, abrir `/productos`.
   - Debe redirigir a `/login`.

2. Con vendedor, abrir `/admin`.
   - Debe redirigir a `/dashboard`.

3. Con admin, abrir `/productos`.
   - Debe redirigir a `/admin`.

4. Con vendedor inactivo.
   - Debe cerrar sesion y mostrar cuenta inactiva.

5. Con vendedor, crear pedido.
   - El cliente envia solo producto y cantidad.
   - El precio, descuento y total se calculan en PostgreSQL.

6. Con admin, aprobar pedido.
   - El stock baja solo al aprobar.
   - Si no hay stock suficiente, la aprobacion falla.

## Operacion diaria

- Crear vendedores desde Supabase Auth o desde una pantalla admin futura.
- Activar vendedores en `profiles.is_active`.
- Cambiar precios solo desde `/admin/productos`.
- Revisar pedidos pendientes en `/admin/pedidos`.
- No editar pedidos aprobados manualmente desde tablas.

## Antes de una version comercial

- Activar dominio propio con HTTPS.
- Configurar SMTP propio para emails de Supabase Auth.
- Activar MFA para usuarios administradores.
- Agregar backups/PITR si el plan de Supabase lo permite.
- Agregar auditoria de cambios de precio y stock.
- Agregar pantalla para crear/activar vendedores sin entrar a Supabase.
