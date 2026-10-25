# Finanzas Personales — Regla 50/30/20

Gestión de finanzas personales con dashboard, suscripciones y sincronización Excel. Pensado para SMI 2026 (1.221€ brutos en 14 pagas) y meta de colchón sept-2027.

## Stack

- Next.js 16 (App Router)
- Prisma + SQLite local
- shadcn/ui + TailwindCSS v4
- React Query, Recharts, xlsx

## Setup

```bash
# Instala dependencias
bun install

# Genera el cliente de Prisma y sincroniza el esquema
bun run db:generate
bun run db:push

# Arranca el servidor de desarrollo
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando               | Descripción                  |
| --------------------- | ---------------------------- |
| `bun run dev`         | Servidor de desarrollo       |
| `bun run build`       | Build de producción          |
| `bun run start`       | Arranca el build standalone  |
| `bun run db:push`     | Sincroniza el esquema Prisma |
| `bun run db:generate` | Genera el cliente Prisma     |

## Datos

Los datos se almacenan en SQLite local (`db/custom.db`). La app permite exportar/importar a Excel (.xlsx) para abrirlo en OnlyOffice/LibreOffice o subirlo a Google Drive.
