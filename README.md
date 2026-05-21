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
npm run build
```

Si PowerShell bloquea `npm.ps1`, usar el ejecutable de Windows:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

## Documentacion interna

- `docs/deployment-vercel.md`: despliegue en Vercel.
- `docs/security-and-ops.md`: seguridad minima y operacion.
- `docs/scaling-roadmap.md`: roadmap para escalar despues del MVP.

## Base de datos

Migracion principal:

```txt
supabase/migrations/202605190001_initial_schema.sql
```

Auditoria de seguridad:

```txt
supabase/security_audit.sql
```
