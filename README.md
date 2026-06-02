# Andina de Alimentos

MVP web para vendedores y administradores de productos congelados.

## Stack

- Next.js App Router
- Supabase Auth
- PostgreSQL + Row Level Security
- TailwindCSS
- Vercel

## Desarrollo local

```powershell
npm install
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

## Variables de entorno

Crear `.env.local` desde `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tu_clave_publica
```

## Scripts

```powershell
npm run dev
npm run lint
npm test
npm run test:e2e
npm run build
```

Si PowerShell bloquea `npm.ps1`, usar el ejecutable de Windows:

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run lint
npm.cmd run build
```

Para preparar las pruebas E2E la primera vez:

```powershell
npx playwright install chromium
```

Las pruebas E2E levantan Next.js automaticamente en `http://localhost:3000`.

## Documentacion interna

- `docs/api-and-integration-decisions.md`: decisiones sobre Server Actions, RPC y REST futura.
- `docs/architecture-ddd-hexagonal.md`: aplicacion de DDD y arquitectura hexagonal.
- `docs/database-design.md`: modelo relacional, RLS, RPC y reglas de stock.
- `docs/defense-guide.md`: guia para defender los flujos y decisiones del proyecto.
- `docs/git-workflow.md`: flujo de ramas, commits, GitHub, GitLab y rollback.
- `docs/security-model.md`: modelo de seguridad por capas, roles, RLS y secretos.
- `docs/software-engineering-evidence.md`: evidencias de conceptos del curso aplicados al proyecto.
- `docs/deployment-vercel.md`: despliegue en Vercel.
- `docs/security-and-ops.md`: seguridad minima y operacion.
- `docs/scaling-roadmap.md`: roadmap para escalar despues del MVP.
- `docs/testing-strategy.md`: estrategia de pruebas y puerta de calidad.

## Base de datos

Migracion principal:

```txt
supabase/migrations/202605190001_initial_schema.sql
```

Auditoria de seguridad:

```txt
supabase/security_audit.sql
```
