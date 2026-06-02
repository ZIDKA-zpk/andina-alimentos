# Mapa de aprendizaje del proyecto

Este documento es tu ruta para dominar Andina de Alimentos y defenderlo con
seguridad. La idea no es memorizar archivos: es entender como viaja una accion
del usuario desde la pantalla hasta la base de datos, y por que cada capa existe.

## Como estudiar sin perderse

Estudia el proyecto por flujos, no por archivos sueltos.

```txt
Pantalla -> Server Action -> validacion -> caso de uso -> dominio -> Supabase -> PostgreSQL
```

Cuando abras un archivo, responde siempre estas cuatro preguntas:

1. Que responsabilidad tiene?
2. A quien llama?
3. Quien lo llama?
4. Que error evita o que regla protege?

Si puedes responder eso, ya estas entendiendo arquitectura.

## Ruta 0: Preparar entorno

Objetivo:

```txt
Saber levantar, probar y construir el proyecto en tu maquina.
```

Archivos y comandos:

```txt
package.json
.env.example
README.md
```

Comandos:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run test:all
```

Debes poder explicar:

```txt
npm install instala dependencias.
npm run dev levanta Next.js en desarrollo.
npm run test:all ejecuta lint, pruebas unitarias, pruebas E2E y build.
.env.local conecta el proyecto local con Supabase.
```

Mini ejercicio:

```txt
Ejecuta npm.cmd run dev, entra a http://localhost:3000 y confirma que el login
carga correctamente.
```

## Ruta 1: Mapa de carpetas

Objetivo:

```txt
Entender donde vive cada responsabilidad del sistema.
```

Carpetas principales:

```txt
src/app
Rutas, pantallas y layouts de Next.js.

src/components
Componentes visuales reutilizables.

src/actions
Operaciones de servidor llamadas desde formularios o pantallas.

src/application
Casos de uso. Coordinan datos antes de llamar al dominio.

src/domain
Reglas puras del negocio.

src/lib
Infraestructura, Supabase, auth, consultas, validaciones y utilidades.

src/types
Tipos compartidos del dominio.

supabase/migrations
Estructura y funciones SQL versionadas.

tests/e2e
Pruebas de navegador con Playwright.

docs
Documentacion tecnica y academica del proyecto.
```

Debes poder explicar:

```txt
La UI no deberia contener reglas criticas de negocio. Las reglas puras van al
dominio, los casos de uso a application y las operaciones con servidor a actions
o lib.
```

Mini ejercicio:

```txt
Abre src/app, src/actions, src/domain y supabase/migrations. Explica en voz alta
por que no estan mezclados en una sola carpeta.
```

## Ruta 2: Login y autenticacion

Objetivo:

```txt
Entender como entra un usuario y como el sistema sabe si es admin o vendedor.
```

Archivos:

```txt
src/app/(auth)/login/page.tsx
src/actions/auth.ts
src/lib/auth.ts
src/lib/auth-routes.ts
src/lib/supabase/server.ts
src/lib/supabase/middleware.ts
src/proxy.ts
src/app/auth/callback/route.ts
```

Flujo:

```txt
1. El usuario abre /login.
2. El formulario envia email y password a login.
3. La Server Action valida datos.
4. Supabase Auth valida credenciales.
5. El sistema consulta profiles.
6. Segun role y is_active redirige al usuario.
7. El middleware mantiene la sesion sincronizada.
```

Debes poder explicar:

```txt
Supabase Auth valida la identidad, pero la tabla profiles guarda el rol de
negocio. No basta saber quien es el usuario; tambien necesitamos saber que puede
hacer dentro de Andina de Alimentos.
```

Mini ejercicio:

```txt
Busca donde se redirige un admin y donde se redirige un vendedor despues del
login.
```

## Ruta 3: Roles y rutas protegidas

Objetivo:

```txt
Entender por que un vendedor no puede entrar a pantallas de administrador.
```

Archivos:

```txt
src/app/admin/layout.tsx
src/app/(seller)/layout.tsx
src/lib/auth.ts
src/lib/auth-routes.ts
src/actions/products.ts
src/actions/orders.ts
src/actions/sellers.ts
```

Flujo:

```txt
1. El layout de admin exige rol admin.
2. El layout de vendedor exige rol seller.
3. Las Server Actions vuelven a validar el rol.
4. La base de datos tambien protege con RLS.
```

Debes poder explicar:

```txt
La seguridad esta en capas. Aunque alguien intente entrar por URL o llamar una
accion desde fuera de la pantalla, el servidor y la base de datos vuelven a
validar permisos.
```

Mini ejercicio:

```txt
Encuentra una Server Action que use requireRole("admin") y explica que pasaria
si un vendedor intentara ejecutarla.
```

## Ruta 4: Flujo del vendedor

Objetivo:

```txt
Entender la experiencia principal del vendedor.
```

Archivos:

```txt
src/app/(seller)/dashboard/page.tsx
src/app/(seller)/productos/page.tsx
src/app/(seller)/pedidos/page.tsx
src/components/products/product-order-panel.tsx
src/lib/data.ts
src/lib/format.ts
```

Flujo:

```txt
1. El vendedor entra a /dashboard.
2. Puede ver productos activos.
3. Selecciona cantidades en el panel de pedido.
4. Revisa total, descuentos y promociones.
5. Envia el pedido.
6. Revisa su historial.
```

Debes poder explicar:

```txt
El vendedor no modifica productos ni stock. Solo consulta productos activos y
crea pedidos. El stock visible ya considera reservas temporales.
```

Mini ejercicio:

```txt
Cambia cantidades en el pedido y ubica que funcion calcula el total estimado.
```

## Ruta 5: Crear pedido de punta a punta

Objetivo:

```txt
Dominar el flujo mas importante del sistema.
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

Flujo:

```txt
1. ProductOrderPanel arma los items del pedido.
2. El boton se deshabilita mientras se envia.
3. Se genera una idempotency_key.
4. createOrder recibe el FormData.
5. Zod valida cantidades, notas e idempotency_key.
6. La accion llama la RPC create_order.
7. PostgreSQL valida duplicados, stock y productos.
8. Se crea el pedido pendiente.
9. El stock queda reservado temporalmente.
```

Debes poder explicar:

```txt
El frontend mejora la experiencia bloqueando doble clic, pero la proteccion real
esta en backend y base de datos con idempotency_key, request_hash y transacciones
SQL.
```

Mini ejercicio:

```txt
Busca en SQL donde se valida stock insuficiente y donde se descuenta stock al
crear un pedido pendiente.
```

## Ruta 6: DDD y arquitectura hexagonal

Objetivo:

```txt
Explicar donde se aplican DDD y arquitectura hexagonal sin exagerar el MVP.
```

Archivos:

```txt
src/domain/orders/pricing.ts
src/domain/orders/status.ts
src/application/orders/calculate-order-estimate.ts
src/types/domain.ts
docs/architecture-ddd-hexagonal.md
docs/software-engineering-evidence.md
```

Modelo mental:

```txt
domain
Reglas puras del negocio. No sabe de React, Supabase ni formularios.

application
Casos de uso. Prepara datos y llama al dominio.

app/components
Adaptadores de entrada. Muestran UI y reciben acciones del usuario.

actions/lib/supabase
Adaptadores de salida. Hablan con servidor, validaciones, Supabase y base.
```

Debes poder explicar:

```txt
La arquitectura hexagonal busca que el dominio no dependa de frameworks. En este
proyecto se aplica gradualmente en reglas como calculo de precios y estados de
pedido.
```

Mini ejercicio:

```txt
Abre pricing.ts y confirma que no importa React, Next.js ni Supabase. Esa es la
evidencia mas clara de dominio puro.
```

## Ruta 7: Base de datos, RLS y RPC

Objetivo:

```txt
Entender que PostgreSQL no es solo almacenamiento: tambien protege integridad.
```

Archivos:

```txt
docs/database-design.md
docs/security-model.md
supabase/migrations/202605190001_initial_schema.sql
supabase/migrations/202605220001_order_safety.sql
supabase/migrations/202605220002_stock_reservation.sql
supabase/security_audit.sql
supabase/verify_after_migration.sql
```

Tablas:

```txt
profiles
products
discount_rules
orders
order_items
```

Funciones:

```txt
create_order
approve_order
reject_order
cancel_order
```

Debes poder explicar:

```txt
Las RPC concentran operaciones criticas porque necesitan transacciones. Crear un
pedido, reservar stock y evitar duplicados debe ocurrir como una unidad.
```

Mini ejercicio:

```txt
Explica que pasaria con el stock si create_order estuviera dividido en varias
consultas independientes desde el frontend.
```

## Ruta 8: Flujo del administrador

Objetivo:

```txt
Entender como el administrador opera el negocio.
```

Archivos:

```txt
src/app/admin/page.tsx
src/app/admin/productos/page.tsx
src/app/admin/pedidos/page.tsx
src/app/admin/vendedores/page.tsx
src/actions/products.ts
src/actions/orders.ts
src/actions/sellers.ts
src/lib/validators/products.ts
src/lib/validators/sellers.ts
```

Flujos:

```txt
Productos
El admin modifica precios, promociones, stock y estado activo.

Pedidos
El admin aprueba o rechaza pedidos pendientes.

Vendedores
El admin ve vendedores registrados y puede activar o desactivar cuentas.
```

Debes poder explicar:

```txt
El administrador opera desde pantallas, no desde SQL manual. Eso convierte
tareas tecnicas en tareas de negocio y reduce errores humanos.
```

Mini ejercicio:

```txt
Edita mentalmente un producto: ubica la pantalla, la Server Action, el validador
y la tabla afectada.
```

## Ruta 9: Pruebas y calidad

Objetivo:

```txt
Entender que se prueba y por que eso ayuda en una evaluacion.
```

Archivos:

```txt
docs/testing-strategy.md
src/lib/auth-routes.test.ts
src/lib/format.test.ts
src/lib/orders/pricing.test.ts
src/lib/validators/orders.test.ts
src/lib/validators/products.test.ts
src/lib/validators/sellers.test.ts
src/domain/orders/status.test.ts
tests/e2e/public-navigation.spec.ts
playwright.config.ts
vitest.config.mts
```

Comandos:

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run lint
npm.cmd run build
npm.cmd run test:all
```

Debes poder explicar:

```txt
Vitest prueba reglas pequenas y rapidas. Playwright prueba navegacion real en
browser. El build confirma que Next.js puede compilar para produccion.
```

Mini ejercicio:

```txt
Ejecuta npm.cmd test y abre una prueba de validacion. Explica que caso bueno y
que caso malo protege.
```

## Ruta 10: Git, GitHub, GitLab y despliegue

Objetivo:

```txt
Entender como se versiona, comparte y despliega el proyecto.
```

Archivos:

```txt
docs/git-workflow.md
docs/deployment-vercel.md
README.md
```

Comandos clave:

```powershell
git status
git branch
git add .
git commit -m "mensaje claro"
git push origin feature/gestion-vendedores
git push gitlab feature/gestion-vendedores
```

Debes poder explicar:

```txt
Git controla versiones localmente. GitHub y GitLab son servidores remotos donde
se comparte el repositorio. Vercel despliega desde la rama configurada.
```

Mini ejercicio:

```txt
Usa git log --oneline -5 y explica que cambio agrego cada commit reciente.
```

## Plan de estudio recomendado

### Dia 1: Levantar y recorrer

```txt
Lee README.md.
Levanta npm.cmd run dev.
Abre todas las rutas principales.
Mira src/app y entiende cada pagina.
```

### Dia 2: Login y roles

```txt
Estudia login, auth.ts, layouts y middleware.
Explica como se separa admin de vendedor.
```

### Dia 3: Pedido completo

```txt
Sigue el flujo desde ProductOrderPanel hasta create_order.
Ubica idempotency_key, validacion Zod y reserva de stock.
```

### Dia 4: Base de datos

```txt
Lee database-design.md.
Abre las migraciones.
Explica tablas, relaciones, RLS y RPC.
```

### Dia 5: DDD y hexagonal

```txt
Lee architecture-ddd-hexagonal.md.
Abre domain y application.
Explica por que pricing.ts no depende de Next.js.
```

### Dia 6: Tests

```txt
Lee testing-strategy.md.
Ejecuta npm.cmd run test:all.
Explica que valida cada tipo de prueba.
```

### Dia 7: Defensa final

```txt
Lee defense-guide.md.
Practica una explicacion de 5 minutos.
Prepara respuestas sobre Supabase, Vercel, seguridad, Git, DDD y pruebas.
```

## Checklist de defensa

Antes de presentar, deberias poder responder sin leer:

```txt
Que problema resuelve Andina de Alimentos?
Que puede hacer un vendedor?
Que puede hacer un administrador?
Como se evita que un vendedor vea datos de otro?
Como se evita un pedido duplicado?
Como se reserva stock?
Que pasa si un pedido se rechaza?
Donde estan las reglas de negocio?
Donde esta aplicado DDD?
Donde esta aplicada arquitectura hexagonal?
Que hace Supabase?
Que hace Vercel?
Que pruebas existen?
Como volverias a una version anterior con Git?
Como migrarias a una API REST o backend propio despues?
```

## Orden recomendado para defender el codigo

```txt
1. README.md
2. docs/software-engineering-evidence.md
3. src/app/(auth)/login/page.tsx
4. src/actions/auth.ts
5. src/app/(seller)/productos/page.tsx
6. src/components/products/product-order-panel.tsx
7. src/actions/orders.ts
8. src/domain/orders/pricing.ts
9. supabase/migrations/202605220002_stock_reservation.sql
10. src/app/admin/pedidos/page.tsx
11. src/app/admin/vendedores/page.tsx
12. docs/testing-strategy.md
13. docs/git-workflow.md
```

## Frase final para el docente

```txt
El proyecto empezo como un MVP rapido, pero se organizo para crecer: tiene
capas, roles, validaciones, RLS, funciones transaccionales, pruebas, Git,
documentacion y una aplicacion gradual de DDD y arquitectura hexagonal.
```
