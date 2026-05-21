# Roadmap de escalabilidad

Este MVP debe crecer por etapas. La regla practica: no agregar complejidad hasta que haya una senal operativa clara.

## Estado actual

```txt
Next.js App Router
Supabase Auth
PostgreSQL + RLS
Server Actions
Vercel
```

Esto alcanza para:

- vendedores registrados manualmente;
- catalogo simple;
- pedidos pendientes/aprobados/rechazados;
- descuentos por cantidad;
- stock unico por producto;
- administracion basica.

## Fase 1: ordenar operacion interna

Hacer cuando haya uso diario real.

### 1. Auditoria de cambios

Problema:

- hoy se puede cambiar precio/stock, pero no queda historial del cambio.

Agregar:

```sql
product_price_history
- id
- product_id
- old_base_price
- new_base_price
- old_promo_price
- new_promo_price
- changed_by
- created_at

inventory_movements
- id
- product_id
- movement_type: adjustment | order_approved | return
- quantity
- previous_stock
- new_stock
- reference_order_id
- created_by
- created_at
```

Regla:

- nunca editar stock sin registrar movimiento.

### 2. Activacion de vendedores desde admin

Problema:

- hoy se activa vendedor con SQL manual.

Agregar pantalla:

```txt
/admin/vendedores
  - activar/desactivar
  - cambiar nombre
  - agregar telefono
```

Server Actions:

```txt
activateSeller
deactivateSeller
updateSellerProfile
```

### 3. Detalle completo de pedido

Agregar:

```txt
/pedidos/[id]
/admin/pedidos/[id]
```

Mostrar:

- items;
- cantidades;
- precio congelado;
- descuento aplicado;
- subtotal;
- total;
- estado.

## Fase 2: inventario serio

Hacer cuando haya mas de un punto de almacenamiento o reparto.

### 1. Almacenes

Cambiar de:

```txt
products.stock_qty
```

a:

```sql
warehouses
- id
- name
- city
- is_active

warehouse_stock
- warehouse_id
- product_id
- stock_qty
```

El stock deja de vivir solo en `products`.

### 2. Reserva de stock

Problema:

- si muchos vendedores crean pedidos, todos ven stock disponible hasta que admin aprueba.

Agregar:

```sql
reserved_stock
- product_id
- warehouse_id
- order_id
- quantity
- expires_at
```

Regla:

- pedido pendiente reserva stock por cierto tiempo;
- si se rechaza/cancela, libera reserva;
- si se aprueba, convierte reserva en salida real.

### 3. Lotes y vencimientos

Importante para congelados.

Agregar:

```sql
inventory_batches
- id
- product_id
- warehouse_id
- lot_code
- expires_at
- stock_qty
```

Regla:

- salida por FEFO: first-expired, first-out.

## Fase 3: logistica y entregas

Hacer cuando el pedido aprobado necesite seguimiento.

Agregar:

```sql
delivery_routes
- id
- name
- delivery_date
- driver_name
- status

delivery_stops
- id
- route_id
- order_id
- address
- sequence
- status
```

Estados:

```txt
pending
assigned
in_transit
delivered
failed
```

Pantallas:

```txt
/admin/rutas
/admin/rutas/[id]
```

## Fase 4: comisiones de vendedores

Hacer cuando la empresa pague incentivos.

Agregar:

```sql
commission_rules
- id
- product_id
- min_qty
- percent
- active

seller_commissions
- id
- seller_id
- order_id
- amount
- status: pending | approved | paid
- created_at
```

Regla:

- calcular comision solo cuando pedido esta aprobado;
- congelar comision en tabla historica.

## Fase 5: reportes

Hacer cuando admin necesite decisiones comerciales.

Primero usar vistas SQL:

```sql
sales_by_product_daily
sales_by_seller_daily
pending_orders_summary
low_stock_products
```

Luego, si crecen datos:

- materialized views;
- indices por fecha;
- jobs programados para refrescar reportes.

Indicadores iniciales:

```txt
ventas por dia
ventas por vendedor
productos mas vendidos
pedidos pendientes
stock bajo
descuentos otorgados
```

## Fase 6: notificaciones

Hacer cuando el equipo deje de revisar manualmente.

Eventos:

- pedido creado;
- pedido aprobado;
- pedido rechazado;
- stock bajo;
- vendedor nuevo pendiente.

Opciones:

```txt
Email: Supabase/Auth o proveedor externo
WhatsApp: proveedor externo
Jobs programados: Vercel Cron
Webhooks: Supabase Database Webhooks + Edge/API endpoint
```

Recomendacion:

- para MVP extendido, usar rutas API de Next.js en Vercel;
- para eventos directamente desde base, evaluar Supabase Database Webhooks;
- para tareas recurrentes, usar Vercel Cron.

## Fase 7: performance

Hacer cuando las tablas pasen de miles a decenas/cientos de miles de filas.

Agregar indices segun consultas reales:

```sql
create index orders_created_at_idx on orders(created_at desc);
create index orders_seller_status_idx on orders(seller_id, status);
create index orders_status_created_idx on orders(status, created_at desc);
create index order_items_product_idx on order_items(product_id);
```

Regla:

- no crear indices "por si acaso";
- revisar queries lentas antes;
- agregar indice cuando una pantalla real lo necesite.

## Fase 8: multiempresa o franquicias

No hacerlo ahora.

Si Andina quiere operar varias empresas/sucursales aisladas:

```sql
organizations
- id
- name

organization_members
- organization_id
- profile_id
- role
```

Luego agregar `organization_id` a:

```txt
products
orders
warehouses
discount_rules
delivery_routes
```

Esto impacta RLS en casi todo, por eso no conviene meterlo antes de necesitarlo.

## Que no escalar todavia

No agregar ahora:

- microservicios;
- Kubernetes;
- backend separado en NestJS;
- colas complejas;
- app movil nativa;
- multi-tenant;
- ERP completo;
- facturacion electronica si aun no esta validada.

El MVP debe probar ventas, pedidos y operacion.

## Orden recomendado real

1. Detalle de pedido.
2. Activar vendedores desde admin.
3. Auditoria de stock/precio.
4. Movimientos de inventario.
5. Almacenes.
6. Reportes.
7. Notificaciones.
8. Rutas de entrega.
9. Comisiones.
10. Multiempresa.

## Decision tecnica clave

Mantener:

```txt
Next.js + Supabase + PostgreSQL
```

hasta que exista una razon concreta para separar servicios.

Separar backend solo si:

- integraciones externas crecen mucho;
- hay jobs largos;
- se necesitan colas;
- el equipo tecnico crece;
- las reglas de negocio ya no caben bien en SQL + Server Actions.
