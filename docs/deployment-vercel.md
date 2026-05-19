# Despliegue en Vercel

## 1. Subir el proyecto a GitHub

Desde la carpeta del proyecto:

```powershell
cd C:\Users\Pc\Documents\Codex\andina-alimentos
git status
git add .
git commit -m "MVP inicial Andina de Alimentos"
```

Crea un repositorio vacío en GitHub y conecta el remoto:

```powershell
git remote add origin https://github.com/TU-USUARIO/andina-alimentos.git
git branch -M main
git push -u origin main
```

## 2. Crear proyecto en Vercel

1. Entra a https://vercel.com.
2. Selecciona Add New Project.
3. Importa el repositorio `andina-alimentos`.
4. Framework Preset: Next.js.
5. Build Command: `npm run build`.
6. Output Directory: dejar vacío.

## 3. Variables de entorno

Agrega estas variables en Vercel, para Production y Preview:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
```

Los valores deben ser los mismos de tu `.env.local`.

## 4. URLs de autenticación en Supabase

En Supabase:

```txt
Authentication > URL Configuration
```

Configura:

```txt
Site URL:
https://TU-PROYECTO.vercel.app

Redirect URLs:
http://localhost:3000/auth/callback
https://TU-PROYECTO.vercel.app/auth/callback
```

Si luego agregas dominio propio, agrega también:

```txt
https://TU-DOMINIO.com/auth/callback
```

## 5. Probar producción

1. Abre la URL de Vercel.
2. Entra con `vendedor@andina.com`.
3. Crea un pedido.
4. Cierra sesión.
5. Entra con `admin@andina.com`.
6. Aprueba el pedido.
7. Revisa que bajó el stock en `/admin/productos`.
