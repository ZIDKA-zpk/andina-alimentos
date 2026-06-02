# CI/CD y gates de calidad

Este documento aterriza el material de calidad y entrega de valor en Andina de
Alimentos. La idea central es que el proyecto no solo debe funcionar en la
maquina local: tambien debe poder comprobar automaticamente su calidad antes de
mezclarse o desplegarse.

## 1. Que significa calidad en este proyecto

Calidad no es solo que "abra la pagina". Para este MVP significa:

```txt
Funcionalidad correcta
Los vendedores pueden crear pedidos y los administradores pueden gestionarlos.

Confiabilidad
El sistema evita pedidos duplicados y maneja stock reservado.

Seguridad por diseno
Hay roles, layouts protegidos, Server Actions, validaciones y RLS.

Mantenibilidad
El codigo esta separado en app, components, actions, application, domain y lib.

Experiencia de usuario
El vendedor ve promociones, stock, historial y mensajes claros.
```

## 2. Que significa valor

Valor es lo que ayuda a un usuario real a resolver su trabajo.

En Andina de Alimentos:

```txt
Para vendedores
Crear pedidos rapido desde celular, ver precios, descuentos y stock.

Para administradores
Controlar productos, vendedores, pedidos pendientes y stock sin usar SQL manual.

Para el negocio
Reducir errores, duplicados y confusion operativa.
```

## 3. Shift left aplicado

Shift left significa detectar problemas antes, cerca del desarrollo.

Ya aplicado:

```txt
Validaciones con Zod antes de tocar la base.
Pruebas unitarias para reglas y validadores.
ESLint para detectar problemas de codigo.
Build de Next.js antes de entregar.
Documentacion tecnica para decisiones importantes.
```

Archivos:

```txt
src/lib/validators
src/domain/orders
src/lib/*.test.ts
docs/testing-strategy.md
```

## 4. Shift right pendiente

Shift right significa observar el sistema despues del despliegue.

Para una etapa empresarial se puede agregar:

```txt
Logs de errores en produccion.
Alertas cuando falla una accion critica.
Monitoreo de tiempo de respuesta.
Auditoria de pedidos aprobados, rechazados o cancelados.
Smoke tests despues de cada deploy.
```

Herramientas posibles:

```txt
Vercel Analytics
Sentry
Supabase logs
UptimeRobot
PostHog
```

## 5. Pipeline CI/CD agregado

Se agregaron dos pipelines equivalentes:

```txt
.github/workflows/quality-gate.yml
.gitlab-ci.yml
```

El objetivo es que GitHub y GitLab puedan verificar la calidad automaticamente.

Gates actuales:

```txt
1. Instalar dependencias con npm ci.
2. Ejecutar ESLint.
3. Ejecutar pruebas unitarias con Vitest.
4. Ejecutar pruebas E2E con Playwright.
5. Compilar produccion con Next.js build.
6. Guardar reporte de Playwright como artifact.
```

Frase para defensa:

```txt
El pipeline funciona como una puerta de calidad. Antes de aceptar cambios, el
repositorio verifica que el codigo tenga lint correcto, pruebas pasando, flujo
E2E basico funcionando y build de produccion exitoso.
```

## 6. Variables necesarias en CI

El proyecto necesita estas variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

En local viven en:

```txt
.env.local
```

En GitHub deben configurarse como:

```txt
Repository Settings -> Secrets and variables -> Actions
```

En GitLab deben configurarse como:

```txt
Project Settings -> CI/CD -> Variables
```

Los pipelines incluyen valores de respaldo para compilar y correr pruebas
publicas, pero en un entorno real conviene guardar las variables reales como
secretos.

## 7. Como se conecta con la piramide de testing

```txt
Base: unit tests
Vitest prueba reglas puras, validaciones y utilidades.

Medio: integration tests
Pendiente para una siguiente etapa: probar Supabase local o una base de staging.

Cima: E2E tests
Playwright prueba navegacion real en browser.
```

Estado actual:

```txt
Unitarias: implementadas.
E2E basicas: implementadas.
Integracion con base real: recomendada como siguiente mejora.
```

## 8. Que no conviene sobredimensionar aun

Para este MVP no es necesario aplicar todavia:

```txt
Kubernetes.
Canary releases.
Chaos testing.
Pentesting trimestral.
Microservicios.
DAST avanzado.
Feature flags complejos.
```

Eso tiene sentido cuando el sistema tenga mas usuarios, mas equipo y mayor
riesgo operativo.

## 9. Siguiente nivel recomendado

Orden recomendado para mejorar calidad sin inflar el proyecto:

```txt
1. Agregar pruebas de integracion contra Supabase local o staging.
2. Agregar smoke test post-deploy.
3. Agregar auditoria de acciones criticas.
4. Agregar monitoreo de errores con Sentry.
5. Separar entornos: desarrollo, staging y produccion.
6. Agregar pull requests obligatorios antes de main.
```

## 10. Resumen para el docente

```txt
Aplicamos calidad integrada: lint, pruebas, build, validaciones y CI/CD. El
pipeline representa un gate de calidad porque evita mezclar o desplegar cambios
sin verificaciones automaticas. Para el tamano actual del equipo, usamos una
estrategia adecuada: unit tests para reglas criticas, E2E para flujos visibles y
build para validar produccion.
```
