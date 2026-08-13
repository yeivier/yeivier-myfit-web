# Desplegar MyFit en Netlify

Este proyecto ya está listo para Netlify (adaptador `@sveltejs/adapter-netlify` + `netlify.toml`). Como es una
app con backend (SvelteKit + Prisma + autenticación), **la forma recomendada es conectar un repositorio Git**,
no arrastrar una carpeta de build suelta.

## 1. Sube el proyecto a un repositorio Git

1. Descomprime este zip.
2. Crea un repositorio nuevo en GitHub/GitLab/Bitbucket y sube el contenido:
   ```bash
   cd myfit
   git init
   git add -A
   git commit -m "Initial commit"
   git remote add origin <URL_DE_TU_REPOSITORIO>
   git push -u origin main
   ```

## 2. Crea el sitio en Netlify

1. Entra a [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Conecta tu repositorio.
3. Netlify detectará automáticamente `netlify.toml` (comando de build `pnpm install --frozen-lockfile && pnpm build`,
   carpeta de publicación `build`). No necesitas cambiar nada ahí.

## 3. Configura la base de datos

La app usa **Prisma** con **CockroachDB** (compatible con PostgreSQL). Necesitas una base de datos accesible desde
internet:

- Opción gratuita: [CockroachDB Cloud](https://www.cockroachlabs.com/get-started-cockroachdb/) (plan Serverless gratuito).
- También funciona con cualquier Postgres estándar (Neon, Supabase, Railway, etc.).

Aplica las migraciones antes del primer despliegue (desde tu máquina, apuntando a la base de datos remota):

```bash
DATABASE_URL="postgresql://usuario:password@host:puerto/basededatos" npx prisma migrate deploy
```

## 4. Variables de entorno en Netlify

En **Site settings → Environment variables**, agrega:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión a tu base de datos CockroachDB/Postgres |
| `AUTH_SECRET` | Sí | Genera una con `npx auth secret` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Opcional | Para login con GitHub |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Opcional | Para login con Google |

(Puedes ver el detalle de cada una en `sample.env`.)

## 5. Despliega

Con las variables configuradas, dispara un nuevo deploy desde Netlify (o simplemente haz push a tu rama principal).
Netlify instalará dependencias, generará el cliente de Prisma (`postinstall`) y compilará el sitio automáticamente.

---

Si en algún momento quieres alojarlo tú mismo sin depender de servicios externos, revisa el `README.md` del proyecto
para las instrucciones de desarrollo local (`pnpm dev`) y creación de usuarios de prueba.
