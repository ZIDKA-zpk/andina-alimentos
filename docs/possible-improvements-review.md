# Revision de proyectos en "posibles mejoras"

Carpeta revisada:

```txt
C:\Users\Pc\Desktop\posibles mejoras
```

## Resumen

Los proyectos encontrados no son modulos Next.js listos para copiar. Son ejemplos/backends en Python, Java, PHP/Laravel y .NET.

La conclusion practica:

- no conviene mezclar esos backends completos con el MVP actual;
- si conviene copiar ideas de arquitectura, validaciones, roles y tests;
- cualquier implementacion debe traducirse a nuestro stack: Next.js + Supabase + PostgreSQL.

## Proyectos encontrados

### DLCR-main

Stack:

```txt
FastAPI
PostgreSQL
SQLAlchemy
JWT
Docker
Reconocimiento facial
```

Util para:

- ideas de arquitectura por capas;
- separacion domain/application/repository/api;
- posible modulo futuro de biometria.

No recomendable ahora:

- reconocimiento facial para este MVP;
- duplicar auth con JWT si ya usamos Supabase Auth.

Riesgo:

- biometria agrega privacidad, consentimiento y seguridad extra.

### fast_api_template-master

Stack:

```txt
FastAPI
Arquitectura domain/application/infrastructure
Usuarios
Roles
JWT
Repositorios
```

Util para:

- patrones de usuarios y roles;
- separacion de casos de uso;
- ideas para tests HTTP;
- convenciones de carpetas si algun dia se crea backend propio.

No recomendable ahora:

- levantar otro backend solo para usuarios;
- reemplazar Supabase Auth en este momento.

### gestion-usuarios-spring-boot-main

Stack:

```txt
Spring Boot
Login simple
JUnit
OpenAPI
```

Util para:

- ejemplo pequeno de login;
- pruebas de controlador.

No recomendable ahora:

- mezclar Java/Spring con Next.js para este MVP;
- duplicar autenticacion.

### laravel-ddd-main

Stack:

```txt
Laravel
DDD simple
Producto
Repository
Service
Tests
Swagger
```

Util para:

- reglas de dominio de producto;
- validacion de precio;
- estructura Repository/Service;
- tests de producto.

Idea aprovechable:

```txt
Producto.crear(nombre, precio)
  valida nombre
  valida precio > 0
```

En nuestro proyecto esto se traduce mejor a:

```txt
Zod schemas
Server Actions
PostgreSQL constraints
```

### sistemaventas-main

Stack:

```txt
.NET Web API
PostgreSQL
Entity Framework
Usuarios
Roles
Productos
Tests
OpenAPI/Scalar
Docker
```

Util para:

- diseno de roles;
- validaciones de dominio;
- separacion ventas/usuarios;
- pruebas de productos;
- posible referencia si algun dia se migra a backend propio.

No recomendable ahora:

- introducir .NET API si Supabase y Server Actions ya resuelven el MVP.

## Que podemos implementar desde estas ideas

### 1. Mejorar dominio de productos

Agregar validaciones mas claras:

- nombre requerido;
- SKU requerido;
- precio base mayor o igual a 0;
- promo menor o igual al precio base;
- stock entero mayor o igual a 0.

Estado actual:

- ya tenemos parte de esto en Zod y constraints SQL.

### 2. Pantalla admin para vendedores

Inspirado por los modulos de usuarios/roles.

Agregar:

```txt
activar vendedor
desactivar vendedor
editar nombre
editar telefono
ver fecha de registro
```

Esto si encaja muy bien con el MVP actual.

### 3. Detalle de pedido

Agregar:

```txt
/pedidos/[id]
/admin/pedidos/[id]
```

Mostrar:

- productos;
- cantidades;
- precio congelado;
- descuento;
- subtotal;
- total.

### 4. Tests basicos

Inspirado en los ejemplos FastAPI/Laravel/.NET.

Agregar pruebas para:

- vendedor no entra a admin;
- admin no crea pedido como vendedor;
- pedido calcula descuento;
- aprobacion descuenta stock;
- promo no supera precio base.

### 5. Documentacion API/operacion

No necesitamos Swagger todavia porque no exponemos API publica.

Pero si conviene documentar:

- flujos;
- roles;
- tablas;
- Server Actions;
- funciones SQL.

## Recomendacion

El mejor siguiente modulo a implementar es:

```txt
Gestion real de vendedores desde admin
```

Porque:

- elimina SQL manual;
- aprovecha ideas de usuarios/roles;
- mejora operacion real del negocio;
- no agrega otro backend;
- encaja con Supabase Auth + profiles.

Segundo mejor modulo:

```txt
Detalle de pedido
```

Porque:

- hace mas usable el sistema;
- permite revisar precios/descuentos;
- ayuda al admin antes de aprobar.

## Decision tecnica

No copiar proyectos completos.

Si reutilizar:

- validaciones;
- estructura mental domain/application;
- pruebas;
- separacion usuarios/roles/productos.

Traducir todo a:

```txt
Next.js Server Actions
Supabase Auth
PostgreSQL/RLS
Zod
React components
```
