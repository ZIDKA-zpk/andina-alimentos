# Aplicacion de materiales de Ingenieria de Software al MVP

Archivos revisados:

```txt
1.pdf
2.pdf
API REST.pptx
Arquitectura de Software.pptx
Arquitecturas de Software.pdf
Calidad y Entrega de Valor.pdf
DDD + Arquitectura Hexagonal.pdf
GIT.pptx
Scrum.pptx
```

## Resumen ejecutivo

El MVP actual ya cumple varias ideas de las diapositivas:

- entrega incremental;
- login y roles;
- arquitectura simple;
- base de datos relacional;
- deploy continuo;
- control de versiones;
- separacion inicial de responsabilidades;
- seguridad con RLS;
- validaciones con Zod y PostgreSQL.

Pero todavia podemos mejorar en:

- tests;
- historias de usuario;
- backlog/sprints;
- documentacion de requisitos;
- detalle de pedido;
- gestion real de vendedores;
- auditoria de stock/precio;
- separacion mas clara de dominio/aplicacion/infraestructura.

## Flatpak

Flatpak es una tecnologia para instalar y distribuir aplicaciones de escritorio en Linux.

Sirve para:

- empaquetar una app una sola vez;
- instalarla en muchas distribuciones Linux;
- aislarla parcialmente mediante sandbox;
- distribuirla por tiendas como Flathub.

No aplica directamente a nuestro MVP web.

Nuestro proyecto es:

```txt
Next.js web app + Supabase + Vercel
```

Flatpak aplicaria si quisieramos crear una aplicacion de escritorio Linux, por ejemplo:

```txt
Andina Desktop
```

pero no para desplegar esta web.

## Ingenieria de Software

Idea central de los materiales:

```txt
software no es solo codigo;
incluye requisitos, diseno, calidad, pruebas, despliegue y mantenimiento.
```

Aplicacion al proyecto:

- definir requisitos funcionales;
- definir requisitos no funcionales;
- documentar arquitectura;
- usar Git correctamente;
- validar calidad antes de desplegar;
- planificar mejoras por etapas.

### Requisitos funcionales actuales

- iniciar sesion;
- separar admin y vendedor;
- ver productos;
- crear pedidos;
- aplicar descuentos por cantidad;
- ver historial;
- aprobar/rechazar pedidos;
- editar precios, promociones y stock;
- ver vendedores.

### Requisitos no funcionales actuales

- responsive;
- mobile-first;
- autenticacion;
- roles;
- seguridad con RLS;
- deploy en Vercel;
- base de datos PostgreSQL;
- mantenibilidad inicial.

### Requisitos no funcionales a agregar

- pruebas automatizadas;
- auditoria de acciones criticas;
- backups;
- monitoreo;
- performance minima;
- trazabilidad de stock;
- documentacion operativa.

## Agile / Scrum

La idea mas importante:

```txt
entregar valor funcional en ciclos cortos
```

Nuestro proyecto ya siguio este enfoque:

```txt
Sprint 1: proyecto Next.js
Sprint 2: estructura y rutas
Sprint 3: Supabase
Sprint 4: base de datos
Sprint 5: auth y roles
Sprint 6: pedidos reales
Sprint 7: deploy
Sprint 8: seguridad
```

### Backlog recomendado

Prioridad alta:

1. Gestion de vendedores desde admin.
2. Detalle de pedido.
3. Tests basicos.
4. Auditoria de stock/precio.

Prioridad media:

5. Movimientos de inventario.
6. Reportes.
7. Notificaciones.
8. Busqueda/filtros.

Prioridad futura:

9. Multi-almacen.
10. Rutas de entrega.
11. Comisiones.
12. App movil o escritorio.

### Historias de usuario

```txt
Como administrador,
quiero activar o desactivar vendedores,
para controlar quien puede vender.

Como vendedor,
quiero ver el detalle de mis pedidos,
para confirmar cantidades, descuentos y total.

Como administrador,
quiero ver el detalle del pedido antes de aprobarlo,
para evitar errores de stock o precio.

Como administrador,
quiero ver movimientos de inventario,
para saber por que bajo o subio el stock.
```

## Git

Los materiales remarcan:

- commits;
- ramas;
- historial;
- volver a versiones anteriores;
- trabajo en equipo.

Flujo recomendado para este proyecto:

```txt
main = produccion
develop = pruebas integradas
feature/nombre = cambios puntuales
```

Regla:

```txt
no trabajar cambios grandes directo en main
```

Comandos utiles:

```powershell
git checkout main
git pull
git checkout -b feature/detalle-pedido
git add .
git commit -m "Agregar detalle de pedido"
git push origin feature/detalle-pedido
```

Luego:

```txt
Pull Request -> Preview en Vercel -> Merge a main
```

## API REST

Las diapositivas explican APIs REST como comunicacion entre cliente y servidor usando HTTP.

Nuestro MVP no expone una REST API publica tradicional.

Actualmente usa:

```txt
Server Actions de Next.js
Supabase client/server
PostgreSQL RPC
```

Esto esta bien para el MVP.

Cuando convendria REST API:

- si una app movil externa consume el sistema;
- si otro sistema necesita integrarse;
- si se separa backend;
- si se requiere documentacion OpenAPI/Swagger.

Posible futuro:

```txt
/api/products
/api/orders
/api/sellers
/api/reports
```

Pero por ahora no es necesario.

## Arquitectura de Software

Las diapositivas hablan de:

- monolito;
- microservicios;
- capas;
- dominio;
- aplicacion;
- infraestructura;
- presentacion;
- arquitectura hexagonal.

Nuestro proyecto hoy es:

```txt
monolito full stack modular
```

Eso es correcto para el MVP.

No conviene microservicios todavia.

### Capas actuales equivalentes

```txt
Presentacion:
src/app
src/components

Aplicacion:
src/actions

Infraestructura:
src/lib/supabase
supabase/migrations

Dominio inicial:
src/types
validaciones Zod
funciones SQL de negocio
```

### Mejora recomendada

Crear una carpeta de dominio mas clara:

```txt
src/domain/
  products/
  orders/
  sellers/
```

Pero hacerlo gradualmente, no refactor masivo.

## DDD + Arquitectura Hexagonal

Ideas clave:

- el codigo debe reflejar el negocio;
- separar autenticacion de usuarios;
- identificar entidades, value objects, aggregates, repositories y eventos;
- no poner reglas de negocio en controllers/UI.

### Dominio de Andina

Bounded contexts posibles:

```txt
Auth
- login
- sesion
- credenciales

Usuarios/Vendedores
- perfiles
- roles
- estado activo

Catalogo
- productos
- precios
- promociones

Pedidos
- ordenes
- items
- descuentos
- estados

Inventario
- stock
- movimientos
- almacenes

Administracion
- aprobaciones
- reportes
```

### Entidades

```txt
Product
Order
OrderItem
Seller/Profile
DiscountRule
```

### Value Objects posibles

```txt
Money
Sku
Quantity
Email
Phone
OrderStatus
```

### Aggregates

```txt
Order
  controla items
  calcula subtotal
  calcula descuento
  calcula total
  cambia estado

Product
  controla precio
  promo
  stock
```

### Eventos de dominio futuros

```txt
OrderCreated
OrderApproved
OrderRejected
StockDecreased
SellerActivated
ProductPriceChanged
```

Uso futuro:

- notificaciones;
- auditoria;
- reportes;
- integraciones.

## Calidad y entrega de valor

Las diapositivas proponen:

- shift left;
- shift right;
- pipeline CI/CD;
- gates de calidad;
- piramide de testing.

### Para nuestro equipo pequeno

No necesitamos testing empresarial gigante.

Minimo recomendable:

```txt
Unit tests para logica pura
Integration tests para Server Actions/RPC importantes
E2E tests para 2 o 3 flujos criticos
```

### Tests prioritarios

1. Vendedor crea pedido.
2. Admin aprueba pedido.
3. Aprobar pedido descuenta stock.
4. Vendedor no entra a admin.
5. Admin no entra a vendedor.
6. Promo no supera precio base.
7. Pedido sin items falla.

### Herramientas sugeridas

```txt
Vitest
Testing Library
Playwright
ESLint
TypeScript
```

## Que podemos implementar ahora

### Modulo 1: gestion real de vendedores

Implementar:

- activar/desactivar vendedor;
- editar nombre;
- editar telefono;
- ver estado;
- evitar SQL manual.

Impacto:

- mejora operacion real;
- usa lo aprendido de usuarios/roles;
- no agrega complejidad externa.

### Modulo 2: detalle de pedido

Implementar:

```txt
/pedidos/[id]
/admin/pedidos/[id]
```

Mostrar:

- items;
- cantidad;
- precio unitario;
- descuento;
- total por linea;
- total general;
- estado.

Impacto:

- admin aprueba con mas informacion;
- vendedor entiende su historial.

### Modulo 3: tests iniciales

Implementar:

- instalar Vitest;
- extraer logica pura de calculo estimado;
- probar validaciones;
- agregar test de build/lint en GitHub Actions.

### Modulo 4: auditoria de inventario

Implementar:

```txt
inventory_movements
product_price_history
```

Impacto:

- trazabilidad;
- control profesional;
- mejor base para reportes.

## Que conviene dejar para despues

- sacar Supabase;
- sacar Vercel;
- microservicios;
- backend FastAPI/.NET/Laravel;
- Kubernetes;
- Flatpak;
- app movil;
- reconocimiento facial;
- multiempresa.

Estas ideas son utiles, pero no antes de fortalecer el MVP actual.

## Si algun dia salimos de Supabase/Vercel

Ruta razonable:

### Etapa 1

Mantener Next.js, cambiar solo base:

```txt
Supabase PostgreSQL -> PostgreSQL propio/managed
Supabase Auth -> Auth.js o backend propio
```

### Etapa 2

Separar backend:

```txt
Next.js frontend
API REST en FastAPI o .NET
PostgreSQL
JWT/Auth propia
```

### Etapa 3

Infraestructura propia:

```txt
VPS o cloud
Docker
Nginx
PostgreSQL
Backups
CI/CD
Monitoreo
```

No hacer esto hasta que exista razon real:

- costos;
- integraciones;
- equipo grande;
- reglas de negocio complejas;
- necesidad de control total.

## Recomendacion final

El siguiente paso mas valioso no es cambiar tecnologia.

Es:

```txt
1. Gestion de vendedores desde admin
2. Detalle de pedido
3. Tests iniciales
4. Auditoria de stock/precio
```

Eso conecta directamente con:

- Scrum;
- calidad;
- arquitectura;
- DDD;
- entrega incremental;
- mantenibilidad.
