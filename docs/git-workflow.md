# Flujo de trabajo con Git

Este documento explica como se usa Git en el proyecto Andina de Alimentos para
controlar versiones, trabajar por ramas y reducir riesgos al cambiar el sistema.

## Objetivo

```txt
Mantener historial claro, poder volver atras y evitar romper produccion.
```

Git no se usa solo para subir archivos. Se usa para:

- registrar versiones;
- separar cambios por ramas;
- revisar progreso;
- volver atras si algo falla;
- sincronizar GitHub y GitLab;
- mantener `main` estable.

## Repositorios remotos

El proyecto tiene dos remotos:

```txt
origin -> GitHub
gitlab -> GitLab
```

Uso:

```txt
GitHub: repositorio principal y despliegue con Vercel.
GitLab: repositorio academico/grupal.
```

Comando para ver remotos:

```powershell
git remote -v
```

## Ramas

### main

Uso:

```txt
Version estable / produccion.
```

Regla:

```txt
No se trabaja directamente en main para cambios grandes.
```

Motivo:

```txt
Vercel puede desplegar desde main. Si main se rompe, produccion se rompe.
```

### feature/gestion-vendedores

Uso:

```txt
Rama de desarrollo y mejoras del MVP.
```

Aqui se trabajaron:

- gestion de vendedores;
- documentacion;
- pruebas unitarias;
- pruebas E2E;
- seguridad de pedidos;
- reserva de stock;
- DDD/hexagonal;
- documentacion de defensa.

Comando para ver rama actual:

```powershell
git status --short --branch
```

## Flujo recomendado

```txt
1. Trabajar en una rama feature.
2. Hacer cambios pequenos.
3. Ejecutar pruebas.
4. Crear commit con mensaje claro.
5. Subir a GitHub/GitLab.
6. Revisar.
7. Merge a main solo cuando este estable.
```

Comandos:

```powershell
git status --short --branch
npm.cmd run test:all
git add .
git commit -m "Mensaje claro"
git push origin feature/gestion-vendedores
git push gitlab feature/gestion-vendedores
```

## Commits

Un commit debe representar un cambio entendible.

Ejemplos del proyecto:

```txt
Agregar pruebas unitarias del MVP
Agregar pruebas e2e con Playwright
Mejorar seguridad al crear pedidos
Reservar stock en pedidos pendientes
Aplicar arquitectura DDD en calculo de pedidos
Modelar estados de pedido en dominio
Documentar estrategia de pruebas
Documentar diseno de base de datos
```

Regla:

```txt
Un commit debe poder explicarse en una frase.
```

Mal ejemplo:

```txt
cambios
cosas
final final
arreglo
```

Buen ejemplo:

```txt
Reservar stock en pedidos pendientes
```

## Como revisar historial

Comando:

```powershell
git log --oneline
```

Uso:

```txt
Ver que cambios se hicieron y en que orden.
```

Para revisar archivos modificados:

```powershell
git status --short
```

Para revisar diferencia antes de commit:

```powershell
git diff
```

## Como volver atras

### Si aun no hiciste commit

Ver archivos modificados:

```powershell
git status --short
```

Restaurar un archivo especifico:

```powershell
git restore ruta/del/archivo
```

Ejemplo:

```powershell
git restore src/app/admin/pedidos/page.tsx
```

Uso real en el proyecto:

```txt
Se revirtio la pantalla avanzada de filtros porque no cumplia lo que se queria.
```

### Si ya hiciste commit

Ver historial:

```powershell
git log --oneline
```

Crear un nuevo commit que revierte uno anterior:

```powershell
git revert HASH_DEL_COMMIT
```

Regla:

```txt
En trabajo compartido se prefiere git revert antes que borrar historial.
```

## Que evitar

Evitar:

```powershell
git reset --hard
```

Motivo:

```txt
Puede borrar cambios locales de forma irreversible.
```

Evitar tambien:

```txt
trabajar todo en main
hacer commits gigantes sin sentido
subir .env.local
subir node_modules
subir reportes temporales
```

## Archivos ignorados

Archivo:

```txt
.gitignore
```

Ignora:

```txt
node_modules
.next
.env.local
playwright-report
test-results
coverage
```

Motivo:

```txt
No todo archivo generado debe entrar al repositorio. Solo codigo, configuracion
y documentacion necesaria.
```

## GitHub y Vercel

Relacion:

```txt
GitHub guarda el codigo.
Vercel despliega la aplicacion desde GitHub.
```

Si Vercel esta conectado a `main`:

```txt
Solo los cambios en main llegan a produccion.
```

Por eso usamos:

```txt
feature/gestion-vendedores para probar
main para estable
```

## GitLab

Uso:

```txt
Repositorio academico/grupal.
```

Subir cambios:

```powershell
git push gitlab feature/gestion-vendedores
```

Si falla autenticacion:

```txt
El problema suele ser token o credenciales, no codigo.
```

## Flujo antes de presentar

Antes de presentar o subir cambios importantes:

```powershell
git status --short --branch
npm.cmd run test:all
git log --oneline -5
```

Debe verse:

```txt
sin archivos modificados inesperados
tests pasando
commits recientes claros
```

## Flujo para merge a main

Cuando una rama feature ya esta probada:

```txt
1. Crear Pull Request o Merge Request.
2. Revisar cambios.
3. Confirmar que npm.cmd run test:all pasa.
4. Hacer merge a main.
5. Vercel despliega produccion.
```

Comandos posibles:

```powershell
git checkout main
git pull origin main
git merge feature/gestion-vendedores
git push origin main
```

Nota:

```txt
Este paso debe hacerse solo cuando se decida actualizar produccion.
```

## Como defenderlo

Respuesta corta:

```txt
Usamos Git para controlar versiones, separar desarrollo en ramas y mantener main
estable. GitHub se usa como remoto principal y GitLab como repositorio academico.
```

Respuesta tecnica:

```txt
Cada mejora importante tiene un commit propio. Antes de subir cambios ejecutamos
pruebas con npm.cmd run test:all. Trabajamos en feature/gestion-vendedores para
no afectar main ni Vercel hasta decidirlo.
```

Respuesta sobre volver atras:

```txt
Si un cambio no gusta antes de commit, se restaura con git restore. Si ya esta
commiteado y compartido, se revierte con git revert para conservar historial.
```
