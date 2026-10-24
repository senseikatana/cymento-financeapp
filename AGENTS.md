Construir tu propia mini-app de finanzas es una excelente manera de tomar el control total, especialmente después de una mala experiencia. La buena noticia es que las herramientas que mencionas (Nuxt, Supabase/InsForge) son perfectas para lo que buscas.

Dado tu objetivo de crear una aplicación **SPA (Single Page Application)** con un dashboard muy interactivo, mi recomendación principal es que te decantes por **Nuxt.js (con Vue.js)** en lugar de Astro. Astro es fantástico para sitios web con mucho contenido estático, pero para una aplicación con tanto estado y reactividad como la que necesitas, Nuxt te ahorrará muchos quebraderos de cabeza.

Aquí tienes una guía y propuesta para empezar a construirla.

### 🏗️ Arquitectura Propuesta: Nuxt + Supabase

Esta combinación es un estándar muy sólido y probado para este tipo de aplicaciones.

- **Frontend (Nuxt.js):** Se encargará de toda la interfaz, la reactividad y la experiencia de usuario. Su sistema de módulos y su integración con Vue lo hacen ideal para un dashboard lleno de componentes interactivos.
- **Backend (Supabase):** Te proporcionará una base de datos PostgreSQL, autenticación de usuarios y una API RESTful automática. Es una solución madura, con una documentación excelente y una gran comunidad, lo que es perfecto para un proyecto personal que quieres mantener a largo plazo.

**Sobre InsForge:** Es una alternativa muy interesante y moderna, diseñada específicamente para ser utilizada con agentes de IA (como yo) para acelerar el desarrollo. Sin embargo, para un proyecto personal en el que la estabilidad y la cantidad de recursos de aprendizaje son clave, **Supabase sigue siendo la opción más recomendada y segura** por su madurez y ecosistema.

### 📊 Esquema de Base de Datos (PostgreSQL en Supabase)

Un buen esquema es la base de todo. Te propongo uno que cubre tus necesidades de CRUD, la regla 50-30-20 y la gestión de suscripciones.

**1. Tabla `transactions` (para todos los movimientos):**

- `id` (UUID, PK)
- `user_id` (UUID, FK a `auth.users`)
- `amount` (Integer, **en céntimos** para evitar errores de redondeo)
- `type` (Enum: `'income'`, `'expense'`)
- `category_id` (UUID, FK a `categories`)
- `description` (Text)
- `transaction_date` (Date)
- `created_at` (Timestamp)
- `deleted_at` (Timestamp, para borrado lógico)

**2. Tabla `categories` (para clasificar tus gastos e ingresos):**

- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `name` (Text)
- `type` (Enum: `'income'`, `'needs'`, `'wants'`, `'savings'`) → **Esto es clave para la regla 50-30-20**
- `color` (VARCHAR(7))
- `icon` (Text, opcional)
- `is_active` (Boolean, para borrado lógico)

**3. Tabla `subscriptions` (para el control detallado que buscas):**

- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `name` (Text)
- `amount` (Integer, en céntimos)
- `currency` (VARCHAR(3))
- `billing_cycle` (Enum: `'monthly'`, `'yearly'`)****
- `billing_every` (Integer, p. ej., 1 para mensual, 12 para anual)
- `next_billing_date` (Date)
- `status` (Enum: `'active'`, `'paused'`, `'cancelled'`)
- `category_id` (UUID, FK a `categories`)

**4. Tabla `user_preferences` (para que la app sea flexible):**

- `user_id` (UUID, PK)
- `needs_percentage` (Integer, default 50)
- `wants_percentage` (Integer, default 30)
- `savings_percentage` (Integer, default 20)

### 🔄 Sincronización con Google Sheets y Excel (.xlsx)

Esta es una parte fundamental de tu idea. Aquí tienes cómo abordarla:

- **Google Sheets:** La mejor forma de integrarlo en Nuxt es usar el módulo **`nuxt-gsheet`**. Te permite leer y escribir datos de forma segura (manteniendo tus credenciales en el servidor) y es muy fácil de usar. Con él, podrías tener una hoja de cálculo como "fuente de la verdad" o para importar/exportar datos de forma masiva. Alternativamente, podrías usar **SheetDB**, que convierte tu hoja de cálculo en una API RESTful.

- **Archivos .xlsx (para OnlyOffice/Local):** Para importar y exportar archivos Excel que descargues en tu disco duro, puedes usar librerías de JavaScript como **`excel-bridge`** (ligera y moderna) o **`Syncfusion`** (muy completa). Estas librerías te permiten leer y escribir archivos .xlsx directamente en el navegador, facilitando la sincronización manual que describes.

### 📝 Pasos para Empezar

1.  **Configura tu entorno:** Instala Nuxt 3 y crea un nuevo proyecto. Luego, crea una cuenta en Supabase y configura tu base de datos con el esquema que te propuse.
2.  **Desarrolla el CRUD básico:** Empieza por lo más simple. Crea las páginas y componentes para listar, crear, editar y borrar transacciones y categorías. La integración de Nuxt con Supabase hace que esto sea muy directo.
3.  **Construye el Dashboard 50-30-20:** Con los datos ya en tu base de datos, crea los componentes visuales (gráficos, tarjetas de resumen) que comparen tus gastos reales por categoría (`needs`, `wants`, `savings`) contra los porcentajes ideales.
4.  **Añade la gestión de suscripciones:** Crea una página dedicada a las suscripciones. El campo `next_billing_date` te permitirá mostrar un calendario de próximos pagos, dándote el control que buscas.
5.  **Implementa la sincronización:** Integra `nuxt-gsheet` para la conexión con Google Sheets y una librería .xlsx para la importación/exportación de archivos locales. Puedes empezar con una sincronización manual (un botón "Exportar a Sheets") y luego intentar automatizarla.

### 💡 Consideraciones Importantes

- **Manejo de Ingresos Variables:** Tu idea de usar la app para gestionar ingresos fluctuantes es perfecta. En el dashboard, en lugar de una cifra fija, puedes calcular el total de ingresos del mes en curso y aplicar la regla 50-30-20 sobre ese total. Para presupuestar, podrías usar tu "ingreso suelo" (el mínimo que esperas) y, cuando llegue un extra, la app te mostraría cómo se distribuye automáticamente en los bloques de ahorro o gastos flexibles.
- **Seguridad:** Con Supabase, asegúrate de configurar las **Políticas de Seguridad a Nivel de Fila (RLS)**. Esto garantiza que tus datos financieros solo sean accesibles por tu usuario, algo crítico para una app personal.
- **Coste:** Tanto Supabase como Vercel (donde puedes desplegar Nuxt) ofrecen planes gratuitos muy generosos que son más que suficientes para un proyecto personal. Solo tendrías que pagar si tu app creciera mucho en usuarios o uso.

```sql
-- ============================================================
--  cymento-financeapp · Esquema de finanzas personales
--  PostgreSQL 14+ · compatible Supabase / InsForge / Neon
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tipos enumerados ----------
do $$ begin
  create type transaction_type as enum ('income', 'expense');
exception when duplicate_object then null; end $$;

do $$ begin
  create type category_type as enum ('income', 'needs', 'wants', 'savings');
exception when duplicate_object then null; end $$;

do $$ begin
  create type billing_cycle as enum ('weekly', 'monthly', 'quarterly', 'yearly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'paused', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------- Trigger reutilizable updated_at ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- categories ----------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  name        text not null,
  type        category_type not null,
  color       text default '#64748b',
  icon        text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  unique (user_id, name, type)
);
create index if not exists idx_categories_user
  on categories(user_id) where deleted_at is null;
drop trigger if exists trg_categories_updated on categories;
create trigger trg_categories_updated before update on categories
  for each row execute function set_updated_at();

-- ---------- subscriptions (antes que transactions: la referencia) ----------
create table if not exists subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null,
  name              text not null,
  amount            numeric(12,2) not null check (amount > 0),
  currency          text not null default 'EUR',
  billing_cycle     billing_cycle not null default 'monthly',
  next_billing_date date not null,
  started_on        date default current_date,
  status            subscription_status not null default 'active',
  category_id       uuid references categories(id) on delete set null,
  url               text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);
create index if not exists idx_subs_user_status
  on subscriptions(user_id, status) where deleted_at is null;
create index if not exists idx_subs_next_date
  on subscriptions(next_billing_date) where deleted_at is null;
drop trigger if exists trg_subs_updated on subscriptions;
create trigger trg_subs_updated before update on subscriptions
  for each row execute function set_updated_at();

-- ---------- transactions ----------
create table if not exists transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null,
  amount           numeric(12,2) not null check (amount > 0),
  type             transaction_type not null,
  category_id      uuid references categories(id) on delete set null,
  subscription_id  uuid references subscriptions(id) on delete set null,
  description      text,
  transaction_date date not null default current_date,
  is_recurring     boolean not null default false,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);
create index if not exists idx_transactions_user_date
  on transactions(user_id, transaction_date desc) where deleted_at is null;
create index if not exists idx_transactions_category
  on transactions(category_id) where deleted_at is null;
drop trigger if exists trg_transactions_updated on transactions;
create trigger trg_transactions_updated before update on transactions
  for each row execute function set_updated_at();

-- ---------- user_preferences ----------
create table if not exists user_preferences (
  user_id              uuid primary key,
  needs_pct            smallint not null default 50 check (needs_pct   between 0 and 100),
  wants_pct            smallint not null default 30 check (wants_pct   between 0 and 100),
  savings_pct          smallint not null default 20 check (savings_pct between 0 and 100),
  currency             text not null default 'EUR',
  monthly_income_floor numeric(12,2),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint pct_sum_100 check (needs_pct + wants_pct + savings_pct = 100)
);
drop trigger if exists trg_prefs_updated on user_preferences;
create trigger trg_prefs_updated before update on user_preferences
  for each row execute function set_updated_at();

-- ---------- Función: sembrar categorías por defecto ----------
create or replace function seed_default_categories(p_user_id uuid)
returns void language plpgsql as $$
begin
  insert into categories (user_id, name, type, color) values
    (p_user_id, 'Nómina',           'income',  '#16a34a'),
    (p_user_id, 'Subsidio / Paro',  'income',  '#22c55e'),
    (p_user_id, 'Otros ingresos',   'income',  '#4ade80'),
    (p_user_id, 'Vivienda / Madre', 'needs',   '#ef4444'),
    (p_user_id, 'Alimentación',     'needs',   '#f97316'),
    (p_user_id, 'Transporte',       'needs',   '#f59e0b'),
    (p_user_id, 'Salud',            'needs',   '#dc2626'),
    (p_user_id, 'Suministros',      'needs',   '#eab308'),
    (p_user_id, 'Ocio',             'wants',   '#8b5cf6'),
    (p_user_id, 'Suscripciones',    'wants',   '#a855f7'),
    (p_user_id, 'Compras',          'wants',   '#ec4899'),
    (p_user_id, 'Formación',        'wants',   '#06b6d4'),
    (p_user_id, 'Fondo emergencia', 'savings', '#0ea5e9'),
    (p_user_id, 'Inversión',        'savings', '#3b82f6'),
    (p_user_id, 'Ahorro libre',     'savings', '#6366f1')
  on conflict (user_id, name, type) do nothing;
end $$;

-- ---------- Vista resumen 50/30/20 por mes ----------
create or replace view v_monthly_summary as
select
  t.user_id,
  date_trunc('month', t.transaction_date)::date as month,
  coalesce(sum(case when t.type = 'income' then t.amount end), 0)                                  as total_income,
  coalesce(sum(case when t.type = 'expense' and c.type = 'needs'   then t.amount end), 0)          as total_needs,
  coalesce(sum(case when t.type = 'expense' and c.type = 'wants'   then t.amount end), 0)          as total_wants,
  coalesce(sum(case when t.type = 'expense' and c.type = 'savings' then t.amount end), 0)          as total_savings
from transactions t
left join categories c on c.id = t.category_id
where t.deleted_at is null
group by t.user_id, date_trunc('month', t.transaction_date);

-- ============================================================
--  SECCIÓN OPCIONAL · SOLO SI USAS SUPABASE (descomenta)
--  Añade FK a auth.users, RLS y seed automático al registrarse
-- ============================================================
/*
alter table categories       add constraint fk_categories_user foreign key (user_id) references auth.users(id) on delete cascade;
alter table transactions     add constraint fk_transactions_user foreign key (user_id) references auth.users(id) on delete cascade;
alter table subscriptions    add constraint fk_subs_user       foreign key (user_id) references auth.users(id) on delete cascade;
alter table user_preferences add constraint fk_prefs_user      foreign key (user_id) references auth.users(id) on delete cascade;

alter table categories       enable row level security;
alter table transactions     enable row level security;
alter table subscriptions    enable row level security;
alter table user_preferences enable row level security;

create policy "own_rows" on categories       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_rows" on transactions     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_rows" on subscriptions    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_rows" on user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_preferences (user_id) values (new.id);
  perform seed_default_categories(new.id);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
*/



-- 1) Inserta tu usuario (sustituye el UUID)
insert into user_preferences (user_id) values ('00000000-0000-0000-0000-000000000001');
select seed_default_categories('00000000-0000-0000-0000-000000000001');

-- 2) Mete un par de movimientos de prueba
insert into transactions (user_id, amount, type, category_id, description, transaction_date)
select '00000000-0000-0000-0000-000000000001', 1141.63, 'income', id, 'Nómina', current_date
from categories where user_id = '00000000-0000-0000-0000-000000000001' and name = 'Nómina';

-- 3) Mira el resumen
select * from v_monthly_summary;


```

<!-- INSFORGE:START -->

## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **cymento-financeapp** (API base `https://j4ufjbah.eu-central.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.

<!-- INSFORGE:END -->
