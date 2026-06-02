# Guia de defensa del proyecto

Esta guia esta pensada para explicar el proyecto frente al docente. No reemplaza
el codigo; sirve para saber que decir, que archivo abrir y como conectar cada
parte del sistema.

## 1. Resumen de 30 segundos

```txt
Andina de Alimentos es un MVP web para gestionar pedidos de productos congelados.
Los vendedores inician sesion, ven productos, crean pedidos y revisan historial.
El administrador gestiona productos, vendedores, stock y pedidos. El sistema usa
Next.js, Supabase Auth, PostgreSQL con RLS, TailwindCSS, pruebas automatizadas y
una arquitectura modular con DDD/hexagonal aplicada gradualmente.
```

## 2. Mapa rapido de carpetas

```txt
src/app
Pantallas y rutas de Next.js.

src/components
Componentes visuales reutilizables.

src/actions
Server Actions: operaciones ejecutadas en servidor.

src/application
Casos de uso de aplicacion.

src/domain
Reglas puras de negocio.

src/lib
Utilidades, acceso a datos, auth, Supabase y validaciones.

supabase/migrations
Base de datos versionada en SQL.

tests/e2e
Pruebas de navegador con Playwright.

docs
Documentacion tecnica y academica.
```

Frase para defender:

```txt
La estructura separa presentacion, aplicacion, dominio e infraestructura. Eso
permite entender y cambiar el sistema sin mezclar todo en un solo archivo.
```

## 3. Flujo de login

Que hace:

```txt
El usuario ingresa email y password. Supabase valida credenciales. Luego el
sistema busca el perfil, verifica si esta activo y redirige segun el rol.
```

Archivos:

```txt
src/app/(auth)/login/page.tsx
src/actions/auth.ts
src/lib/auth.ts
src/lib/auth-routes.ts
src/lib/supabase/server.ts
src/lib/supabase/middleware.ts
```

Explicacion paso a paso:

1. `login/page.tsx` muestra el formulario.
2. El formulario llama la Server Action `login`.
3. `src/actions/auth.ts` valida email/password con Zod.
4. Supabase Auth ejecuta `signInWithPassword`.
5. Se consulta `profiles` para obtener rol y estado activo.
6. Si es admin va a `/admin`; si es vendedor va a `/dashboard`.
7. Middleware protege rutas privadas.

Que decir si preguntan por seguridad:

```txt
No confiamos solo en el frontend. Las rutas estan protegidas por middleware, los
roles se validan en servidor y la base de datos usa Row Level Security.
```

## 4. Flujo de vendedor

Que hace:

```txt
El vendedor ve su panel, productos disponibles, precios, promociones, stock y
puede crear pedidos.
```

Archivos:

```txt
src/app/(seller)/layout.tsx
src/app/(seller)/dashboard/page.tsx
src/app/(seller)/productos/page.tsx
src/app/(seller)/pedidos/page.tsx
src/components/products/product-order-panel.tsx
src/lib/data.ts
```

Explicacion:

1. `layout.tsx` exige rol `seller`.
2. `dashboard/page.tsx` muestra resumen del vendedor.
3. `productos/page.tsx` consulta productos con `getProducts`.
4. `ProductOrderPanel` permite seleccionar cantidades.
5. `pedidos/page.tsx` muestra historial del vendedor.

Frase para defender:

```txt
El vendedor no accede directamente a datos de otros vendedores porque la consulta
esta protegida por RLS en Supabase y por validaciones de rol en Next.js.
```

## 5. Flujo de crear pedido

Que hace:

```txt
El vendedor selecciona productos, el sistema calcula total estimado, valida stock,
evita doble envio y crea el pedido en Supabase.
```

Archivos:

```txt
src/components/products/product-order-panel.tsx
src/actions/orders.ts
src/lib/validators/orders.ts
src/application/orders/calculate-order-estimate.ts
src/domain/orders/pricing.ts
supabase/migrations/202605220001_order_safety.sql
supabase/migrations/202605220002_stock_reservation.sql
```

Explicacion paso a paso:

1. El usuario cambia cantidades en `ProductOrderPanel`.
2. La UI calcula un total estimado llamando a la capa de aplicacion.
3. La capa de aplicacion adapta datos.
4. El dominio calcula precio, promocion y descuento.
5. Al enviar, el boton se bloquea para prevenir doble clic.
6. Se envia una `idempotency_key`.
7. `createOrder` valida el FormData con Zod.
8. Supabase ejecuta RPC `create_order`.
9. PostgreSQL valida productos, cantidades, duplicados y stock.
10. Si todo esta bien, crea pedido y reserva stock.

Frase para defender DDD:

```txt
El calculo de precios vive en dominio porque es una regla del negocio, no una
regla visual. La pantalla solo consume el resultado.
```

Frase para defender backend:

```txt
Aunque el frontend bloquee el boton, el backend tambien evita duplicados con
idempotency_key y request_hash. Asi se protege incluso si hay fallas de red.
```

## 6. Flujo de reserva temporal de stock

Que hace:

```txt
Cuando un vendedor crea un pedido pendiente, el stock se descuenta de inmediato.
Si el pedido se rechaza o cancela, el stock vuelve. Si se aprueba, el descuento
queda confirmado.
```

Archivo:

```txt
supabase/migrations/202605220002_stock_reservation.sql
```

Funciones:

```txt
create_order
approve_order
reject_order
cancel_order
```

Explicacion:

1. `create_order` crea el pedido y baja `products.stock_qty`.
2. Marca `orders.stock_reserved = true`.
3. `approve_order` no vuelve a descontar si ya estaba reservado.
4. `reject_order` restaura stock si estaba reservado.
5. `cancel_order` tambien restaura stock si el vendedor cancela.

Frase para defender:

```txt
Esta regla esta en PostgreSQL porque necesita atomicidad. No debe ocurrir que se
cree el pedido pero falle el descuento de stock, o al reves.
```

## 7. Flujo del administrador

Que hace:

```txt
El administrador entra a su panel, gestiona productos, vendedores y pedidos.
```

Archivos:

```txt
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/productos/page.tsx
src/app/admin/pedidos/page.tsx
src/app/admin/vendedores/page.tsx
src/actions/products.ts
src/actions/orders.ts
src/actions/sellers.ts
```

Explicacion:

1. `admin/layout.tsx` exige rol `admin`.
2. `admin/page.tsx` muestra resumen.
3. `admin/productos` edita precio, promocion, stock y estado.
4. `admin/pedidos` permite aprobar o rechazar pedidos.
5. `admin/vendedores` permite editar y activar vendedores.

Frase para defender:

```txt
La administracion esta separada por layout y por server actions. Aunque alguien
intente llamar una accion manualmente, `requireRole("admin")` valida el rol.
```

## 8. Flujo de productos

Que hace:

```txt
El admin actualiza datos del catalogo y los vendedores ven solo productos activos.
```

Archivos:

```txt
src/app/admin/productos/page.tsx
src/actions/products.ts
src/lib/validators/products.ts
src/lib/data.ts
supabase/migrations/202605190001_initial_schema.sql
```

Validaciones:

```txt
precio base >= 0
precio promocional >= 0
precio promocional <= precio base
stock >= 0
producto activo/inactivo
```

Frase para defender:

```txt
La validacion existe en dos niveles: Zod valida antes de enviar a la base y
PostgreSQL protege integridad con constraints.
```

## 9. Flujo de vendedores

Que hace:

```txt
El administrador puede ver vendedores registrados, cambiar nombre, telefono y
activar o desactivar cuentas.
```

Archivos:

```txt
src/app/admin/vendedores/page.tsx
src/actions/sellers.ts
src/lib/validators/sellers.ts
src/lib/data.ts
```

Frase para defender:

```txt
Esto evita depender de SQL manual para activar vendedores. Es una mejora de
operacion real del sistema.
```

## 10. Base de datos

Archivos:

```txt
docs/database-design.md
supabase/migrations/202605190001_initial_schema.sql
supabase/migrations/202605220001_order_safety.sql
supabase/migrations/202605220002_stock_reservation.sql
supabase/security_audit.sql
supabase/verify_after_migration.sql
```

Tablas principales:

```txt
profiles
products
discount_rules
orders
order_items
```

Funciones RPC:

```txt
create_order
approve_order
reject_order
cancel_order
```

Frase para defender:

```txt
La base de datos tiene responsabilidades de integridad y transaccion. Por eso
stock, duplicados y aprobaciones criticas se validan tambien en PostgreSQL.
```

## 11. Row Level Security

Que hace:

```txt
RLS limita que puede ver o modificar cada usuario desde la base de datos.
```

Documento de soporte:

```txt
docs/security-model.md
```

Ejemplos:

```txt
El vendedor ve sus propios pedidos.
El admin ve todos los pedidos.
Solo admin actualiza productos.
Solo admin actualiza perfiles de vendedores.
```

Archivo:

```txt
supabase/migrations/202605190001_initial_schema.sql
```

Frase para defender:

```txt
RLS es importante porque protege datos incluso si hay un error en una pantalla o
consulta del frontend.
```

## 12. Tests

Archivos:

```txt
src/lib/auth-routes.test.ts
src/lib/format.test.ts
src/lib/orders/pricing.test.ts
src/lib/validators/orders.test.ts
src/lib/validators/products.test.ts
src/lib/validators/sellers.test.ts
tests/e2e/public-navigation.spec.ts
```

Comando:

```powershell
npm.cmd run test:all
```

Que ejecuta:

```txt
eslint
vitest
playwright
next build
```

Frase para defender:

```txt
Tenemos pruebas unitarias para reglas y validaciones, E2E para navegacion real,
lint para calidad de codigo y build para verificar produccion.
```

## 13. Deploy

Herramientas:

```txt
GitHub
Vercel
Supabase
GitLab
```

Archivos:

```txt
docs/deployment-vercel.md
.env.example
```

Frase para defender:

```txt
El deploy esta separado de desarrollo local. El codigo se sube a GitHub/GitLab y
Vercel despliega desde la rama configurada.
```

## 14. Preguntas frecuentes del docente

### Donde esta aplicado DDD?

```txt
En src/domain/orders/pricing.ts. Ahi esta la regla pura de precio, promocion y
descuento del pedido.
```

### Donde esta aplicada arquitectura hexagonal?

```txt
En la separacion entre UI, application y domain. La UI llama un caso de uso y el
caso de uso llama al dominio.
```

### Por que usan Supabase?

```txt
Porque acelera Auth, PostgreSQL y RLS para un MVP. Ademas usamos PostgreSQL y SQL
versionado, por lo que no quedamos totalmente atados a codigo propietario.
```

### Por que no una API REST?

```txt
Porque el MVP es una web full stack con Next.js. Server Actions y RPC son mas
directos. REST se agregaria si una app externa necesita consumir el sistema.
```

Documento de soporte:

```txt
docs/api-and-integration-decisions.md
```

### Como evitan pedidos duplicados?

```txt
En frontend se bloquea el boton al enviar. En backend se usa idempotency_key y
request_hash para evitar registros repetidos.
```

### Como manejan stock concurrente?

```txt
La reserva temporal de stock se hace en PostgreSQL. Crear pedido descuenta stock,
aprobar confirma, rechazar o cancelar restaura.
```

### Como prueban calidad?

```txt
Con npm.cmd run test:all, que ejecuta lint, pruebas unitarias, pruebas E2E y
build de produccion.
```

## 15. Orden recomendado para explicar en vivo

1. Mostrar README.
2. Mostrar estructura de carpetas.
3. Mostrar login.
4. Mostrar productos y creacion de pedido.
5. Mostrar stock reservado en Supabase o admin.
6. Mostrar admin/pedidos.
7. Mostrar admin/vendedores.
8. Mostrar `src/domain/orders/pricing.ts`.
9. Mostrar `docs/software-engineering-evidence.md`.
10. Mostrar `docs/git-workflow.md`.
11. Ejecutar:

```powershell
npm.cmd run test:all
```

## 16. Cierre de defensa

```txt
El sistema aun es un MVP, pero ya aplica conceptos profesionales: requisitos,
roles, seguridad, base de datos relacional, pruebas, control de versiones,
despliegue, DDD y arquitectura hexagonal incremental. La prioridad fue entregar
valor funcional sin perder mantenibilidad.
```
