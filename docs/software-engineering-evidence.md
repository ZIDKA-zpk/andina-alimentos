# Evidencia de Ingenieria de Software aplicada

Este documento conecta los conceptos vistos en clase con partes concretas del
MVP de Andina de Alimentos. Sirve como guia para explicar que el proyecto no es
solo una pagina web, sino una aplicacion construida con criterios de ingenieria.

## Resumen

```txt
Proyecto: Andina de Alimentos
Tipo: MVP web full stack
Stack: Next.js, Supabase, PostgreSQL, TailwindCSS
Enfoque: monolito modular, DDD incremental, arquitectura hexagonal pragmatica
```

El sistema resuelve un flujo real:

```txt
vendedor -> crea pedido -> reserva stock -> admin aprueba/rechaza -> vendedor consulta historial
```

## 1. Requisitos funcionales

Concepto:

```txt
Los requisitos funcionales describen que debe hacer el sistema.
```

Aplicacion en el proyecto:

- iniciar sesion;
- separar vendedores y administradores;
- mostrar productos;
- crear pedidos;
- aplicar descuentos;
- reservar stock;
- aprobar o rechazar pedidos;
- gestionar productos;
- gestionar vendedores;
- consultar historial.

Archivos que lo demuestran:

```txt
src/app/(auth)/login/page.tsx
src/app/(seller)/productos/page.tsx
src/app/(seller)/pedidos/page.tsx
src/app/admin/productos/page.tsx
src/app/admin/pedidos/page.tsx
src/app/admin/vendedores/page.tsx
src/actions/orders.ts
src/actions/products.ts
src/actions/sellers.ts
```

Como defenderlo:

```txt
Cada requisito funcional esta representado por una pantalla, una accion del
servidor o una funcion de base de datos.
```

## 2. Requisitos no funcionales

Concepto:

```txt
Los requisitos no funcionales describen como debe comportarse el sistema.
```

Aplicacion en el proyecto:

- seguridad con autenticacion;
- autorizacion por roles;
- responsive y mobile-first;
- validacion frontend/backend/base de datos;
- pruebas automatizadas;
- despliegue en Vercel;
- base de datos relacional con RLS;
- control de duplicados;
- manejo correcto de zona horaria Bolivia.

Archivos que lo demuestran:

```txt
src/lib/auth.ts
src/lib/auth-routes.ts
src/lib/supabase/middleware.ts
src/lib/format.ts
supabase/migrations/202605190001_initial_schema.sql
supabase/migrations/202605220001_order_safety.sql
supabase/migrations/202605220002_stock_reservation.sql
vitest.config.ts
playwright.config.ts
```

Como defenderlo:

```txt
El proyecto no solo funciona visualmente; tambien valida roles, protege rutas,
controla datos y tiene pruebas para reducir errores.
```

## 3. Scrum y entrega incremental

Concepto:

```txt
Scrum propone entregar valor en incrementos pequenos y revisables.
```

Aplicacion en el proyecto:

El proyecto se construyo por bloques:

```txt
Sprint 1: inicializacion Next.js
Sprint 2: rutas principales
Sprint 3: Supabase y base de datos
Sprint 4: autenticacion y roles
Sprint 5: pedidos reales
Sprint 6: gestion admin
Sprint 7: tests unitarios
Sprint 8: tests E2E
Sprint 9: seguridad de pedidos y stock reservado
Sprint 10: refactor DDD/hexagonal
```

Archivos que lo demuestran:

```txt
docs/course-materials-application.md
docs/scaling-roadmap.md
git log --oneline
```

Como defenderlo:

```txt
No se intento construir todo de golpe. Cada incremento agrego una capacidad
funcional y luego se valido con pruebas o despliegue.
```

## 4. Git y control de versiones

Concepto:

```txt
Git permite registrar versiones, trabajar en ramas y volver atras si algo falla.
```

Aplicacion en el proyecto:

- `main` se mantiene como rama estable;
- `feature/gestion-vendedores` concentra mejoras antes de produccion;
- cada bloque importante tiene commit propio;
- GitHub y GitLab se usan como remotos.

Commits relevantes:

```txt
Agregar pruebas unitarias del MVP
Agregar pruebas e2e con Playwright
Mejorar seguridad al crear pedidos
Reservar stock en pedidos pendientes
Aplicar arquitectura DDD en calculo de pedidos
```

Como defenderlo:

```txt
El historial de Git muestra la evolucion del sistema y permite explicar que se
agrego en cada etapa.
```

Documento detallado:

```txt
docs/git-workflow.md
```

## 5. Arquitectura de software

Concepto:

```txt
La arquitectura organiza responsabilidades para que el sistema sea mantenible.
```

Aplicacion en el proyecto:

```txt
Presentacion:
src/app
src/components

Aplicacion:
src/actions
src/application

Dominio:
src/domain

Infraestructura:
src/lib/supabase
supabase/migrations
```

Archivo principal:

```txt
docs/architecture-ddd-hexagonal.md
```

Como defenderlo:

```txt
El proyecto es un monolito modular: todo vive en un mismo sistema, pero separado
por responsabilidades.
```

## 6. Arquitectura hexagonal

Concepto:

```txt
La arquitectura hexagonal separa el dominio de los detalles externos como UI,
base de datos o frameworks.
```

Aplicacion en el proyecto:

```txt
UI:
src/components/products/product-order-panel.tsx

Caso de uso:
src/application/orders/calculate-order-estimate.ts

Dominio:
src/domain/orders/pricing.ts

Infraestructura:
src/lib/supabase
supabase/migrations
```

Flujo aplicado:

```txt
ProductOrderPanel
-> calculateEstimatedOrderTotal
-> calculateOrderEstimate
```

Como defenderlo:

```txt
La regla de calcular total del pedido no depende de React, Next.js ni Supabase.
Eso permite probarla y mantenerla de forma independiente.
```

## 7. DDD

Concepto:

```txt
DDD busca que el codigo refleje el lenguaje y reglas del negocio.
```

Lenguaje del dominio de Andina:

```txt
Producto
Pedido
Vendedor
Stock
Promocion
Descuento
Aprobacion
Rechazo
Reserva de stock
```

Bounded contexts identificados:

```txt
Catalogo
Pedidos
Inventario
Vendedores
Administracion
```

Aplicacion actual:

```txt
src/domain/orders/pricing.ts
```

Regla de negocio extraida:

```txt
El total estimado de un pedido se calcula usando precio promocional si existe,
descuento por cantidad si aplica y cantidad solicitada.
```

Como defenderlo:

```txt
El dominio empieza en pedidos porque es el centro del negocio. Los conceptos del
codigo coinciden con conceptos reales de la empresa.
```

## 8. Base de datos relacional

Concepto:

```txt
PostgreSQL permite modelar entidades, relaciones, restricciones y transacciones.
```

Tablas principales:

```txt
profiles
products
discount_rules
orders
order_items
```

Migracion principal:

```txt
supabase/migrations/202605190001_initial_schema.sql
```

Documento detallado:

```txt
docs/database-design.md
```

Relaciones:

```txt
profiles -> orders
orders -> order_items
products -> order_items
products -> discount_rules
```

Como defenderlo:

```txt
La base de datos no es solo almacenamiento. Tambien protege integridad con
claves foraneas, checks, indices y funciones transaccionales.
```

## 9. Seguridad

Concepto:

```txt
La seguridad minima incluye autenticacion, autorizacion y validacion.
```

Aplicacion en el proyecto:

- Supabase Auth para login;
- roles `admin` y `seller`;
- rutas protegidas;
- RLS en PostgreSQL;
- funciones RPC con validaciones;
- vendedores inactivos no pueden operar;
- vendedores no pueden entrar a admin.

Archivos:

```txt
src/lib/auth.ts
src/lib/auth-routes.ts
src/lib/supabase/middleware.ts
supabase/security_audit.sql
supabase/migrations/202605190001_initial_schema.sql
```

Como defenderlo:

```txt
La seguridad no esta solo en el frontend. La base de datos tambien valida quien
puede leer, modificar o ejecutar operaciones.
```

## 10. Calidad y pruebas

Concepto:

```txt
La calidad se asegura con validaciones, pruebas y builds repetibles.
```

Herramientas:

```txt
Vitest
Playwright
ESLint
TypeScript
Next.js build
```

Scripts:

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run lint
npm.cmd run build
npm.cmd run test:all
```

Pruebas unitarias:

```txt
src/lib/auth-routes.test.ts
src/lib/format.test.ts
src/lib/orders/pricing.test.ts
src/lib/validators/orders.test.ts
src/lib/validators/products.test.ts
src/lib/validators/sellers.test.ts
```

Pruebas E2E:

```txt
tests/e2e/public-navigation.spec.ts
```

Documento detallado:

```txt
docs/testing-strategy.md
```

Como defenderlo:

```txt
El comando npm.cmd run test:all ejecuta lint, pruebas unitarias, pruebas de
navegador y build de produccion. Es una puerta de calidad antes de subir cambios.
```

## 11. API REST y decisiones de integracion

Concepto:

```txt
Una API permite que sistemas externos se comuniquen con el backend.
```

Decision actual:

```txt
El MVP no expone una API REST publica.
```

Tecnica usada:

```txt
Next.js Server Actions
Supabase client/server
PostgreSQL RPC
```

Justificacion:

```txt
Para un MVP web, Server Actions + RPC reducen complejidad y permiten entregar
valor mas rapido.
```

Cuando agregar REST:

```txt
cuando exista app movil externa, integracion con terceros o backend separado.
```

Como defenderlo:

```txt
No usamos REST por omision; tomamos una decision de arquitectura acorde al
alcance del MVP.
```

## 12. Despliegue

Concepto:

```txt
El despliegue pone el software disponible fuera de la maquina local.
```

Aplicacion:

```txt
Vercel despliega Next.js.
Supabase aloja Auth y PostgreSQL.
GitHub mantiene el repositorio principal.
GitLab mantiene copia academica/grupal.
```

Documentacion:

```txt
docs/deployment-vercel.md
docs/security-and-ops.md
```

Como defenderlo:

```txt
El sistema tiene entorno local para desarrollo y Vercel/Supabase para uso real.
Los cambios se prueban en rama antes de llevarlos a main.
```

## 13. Mantenibilidad

Concepto:

```txt
Un sistema mantenible permite cambiar partes sin romper todo.
```

Aplicacion:

- componentes separados;
- acciones del servidor separadas;
- validadores Zod;
- migraciones SQL versionadas;
- dominio separado gradualmente;
- pruebas automatizadas.

Como defenderlo:

```txt
La estructura permite ubicar rapidamente donde cambiar una pantalla, una regla
de negocio, una validacion o una tabla.
```

## 14. Trazabilidad de decisiones

Decision: usar Supabase.

```txt
Motivo: acelera Auth, PostgreSQL, RLS y despliegue.
Riesgo: dependencia de proveedor.
Mitigacion: PostgreSQL estandar y migraciones SQL versionadas.
```

Decision: usar Vercel.

```txt
Motivo: despliegue rapido de Next.js.
Riesgo: dependencia de plataforma.
Mitigacion: Next.js puede ejecutarse en otros servidores.
```

Decision: mantener monolito.

```txt
Motivo: equipo pequeno y MVP.
Riesgo: crecer sin orden.
Mitigacion: modularizar por capas y dominio.
```

## 15. Como explicarlo en una defensa

Respuesta corta:

```txt
Este proyecto aplica ingenieria de software porque parte de requisitos reales,
usa arquitectura modular, separa reglas de negocio, protege datos, tiene pruebas,
usa control de versiones y esta preparado para despliegue.
```

Respuesta tecnica:

```txt
La capa de presentacion esta en src/app y src/components. Los casos de uso estan
en src/actions y src/application. Las reglas puras empiezan en src/domain. La
infraestructura esta en Supabase y PostgreSQL. Con esto aplicamos una version
pragmatica de DDD y arquitectura hexagonal sin perder la simplicidad del MVP.
```

Respuesta con ejemplo:

```txt
El calculo del total del pedido ya esta separado. La pantalla solo envia datos,
la capa de aplicacion los adapta y el dominio calcula precio, promocion y
descuento sin depender de React ni Supabase.
```
