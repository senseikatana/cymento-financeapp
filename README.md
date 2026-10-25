# Finanzas Personales — Regla 50/30/20

Gestión de finanzas personales con dashboard, suscripciones y sincronización Excel. Pensado para SMI 2026 (1.221€ brutos en 14 pagas) y meta de colchón sept-2027.

## Stack

- Nuxt 4 + Vue 3 (SPA con render SSR de los endpoints Nitro)
- InsForge (Postgres en la nube) con `@insforge/sdk` — sin Prisma ni SQLite
- TailwindCSS v3 + primitivas UI propias (estilo shadcn)
- katanakit-js para formato de importes y fechas
- `xlsx` para importar/exportar Excel

## Setup

```bash
# Instala dependencias
bun install

# Configura las credenciales del backend
cp .env.example .env
# edita .env con INSFORGE_URL e INSFORGE_API_KEY

# Arranca el servidor de desarrollo
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000).

El backend ya está vinculado al proyecto InsForge `cymento-financeapp` (`.insforge/project.json`, ignorado en git). Las migraciones viven en `migrations/` y se aplican con:

```bash
npx -y @insforge/cli db migrations up --all
```

## Scripts

| Comando                | Descripción                     |
| ---------------------- | ------------------------------- |
| `bun run dev`          | Servidor de desarrollo          |
| `bun run build`        | Build de producción (Nuxt)      |
| `bun run preview`      | Previsualiza el build           |
| `bun run lint`         | ESLint                          |
| `bun run lint:fix`     | ESLint con autofix              |
| `bun run format`       | Prettier (formato del proyecto) |
| `bun run format:check` | Comprueba el formato            |

El editor aplica Prettier y ESLint al guardar si usas VS Code (`.vscode/settings.json`).

## Datos

Los datos se almacenan en **InsForge (Postgres)** y el servidor accede con la API key admin solo desde Nitro (nunca en el cliente). La app permite exportar/importar a Excel (`.xlsx`) para abrirlo en OnlyOffice/LibreOffice o subirlo a Google Drive.
