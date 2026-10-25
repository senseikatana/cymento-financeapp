-- ============================================================
--  cymento-financeapp · esquema inicial (InsForge / PostgreSQL)
--  Adaptado de prisma/schema.prisma (SQLite) a Postgres public
-- ============================================================

-- ---------- Trigger reutilizable updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- incomes ----------
create table if not exists public.incomes (
  id         uuid primary key default gen_random_uuid(),
  type       text not null default 'salario'
             check (type in ('salario', 'subsidio_paro', 'ahorros_previos', 'otro')),
  source     text not null,
  amount     numeric(12, 2) not null check (amount >= 0),
  frequency  text not null default 'unico'
             check (frequency in ('unico', 'mensual', 'anual', 'trimestral', 'semestral')),
  date       timestamptz not null default now(),
  active     boolean not null default true,
  notes      text,
  category   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_incomes_active on public.incomes (active);
create index if not exists idx_incomes_date on public.incomes (date desc);

drop trigger if exists trg_incomes_updated on public.incomes;
create trigger trg_incomes_updated
  before update on public.incomes
  for each row execute function public.set_updated_at();

-- ---------- subscriptions ----------
create table if not exists public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  provider      text,
  billing_cycle text not null default 'mensual'
                check (billing_cycle in ('mensual', 'anual', 'trimestral', 'semestral')),
  amount        numeric(12, 2) not null check (amount >= 0),
  start_date    timestamptz not null default now(),
  renewal_date  timestamptz,
  active        boolean not null default true,
  bucket        text not null default 'extraordinario'
                check (bucket in ('fijo', 'extraordinario', 'ahorro')),
  category      text not null default 'suscripcion',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_subscriptions_active on public.subscriptions (active);
create index if not exists idx_subscriptions_renewal on public.subscriptions (renewal_date);

drop trigger if exists trg_subscriptions_updated on public.subscriptions;
create trigger trg_subscriptions_updated
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------- expenses ----------
create table if not exists public.expenses (
  id              uuid primary key default gen_random_uuid(),
  bucket          text not null default 'fijo'
                  check (bucket in ('fijo', 'extraordinario', 'ahorro')),
  category        text not null,
  description     text not null,
  amount          numeric(12, 2) not null check (amount >= 0),
  frequency       text not null default 'unico'
                  check (frequency in ('unico', 'mensual', 'anual', 'trimestral', 'semestral')),
  date            timestamptz not null default now(),
  notes           text,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_expenses_date on public.expenses (date desc);
create index if not exists idx_expenses_bucket on public.expenses (bucket);
create index if not exists idx_expenses_subscription on public.expenses (subscription_id);

drop trigger if exists trg_expenses_updated on public.expenses;
create trigger trg_expenses_updated
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- ---------- settings (fila singleton) ----------
create table if not exists public.settings (
  id          text primary key default 'singleton',
  pct_fixed   numeric(5, 2) not null default 50 check (pct_fixed between 0 and 100),
  pct_extra   numeric(5, 2) not null default 30 check (pct_extra between 0 and 100),
  pct_savings numeric(5, 2) not null default 20 check (pct_savings between 0 and 100),
  rule_base   text not null default 'total' check (rule_base in ('total', 'salario', 'custom')),
  currency    text not null default 'EUR',
  locale      text not null default 'es-ES',
  updated_at  timestamptz not null default now(),
  constraint settings_pct_sum_100 check (pct_fixed + pct_extra + pct_savings = 100)
);

drop trigger if exists trg_settings_updated on public.settings;
create trigger trg_settings_updated
  before update on public.settings
  for each row execute function public.set_updated_at();

insert into public.settings (id) values ('singleton')
on conflict (id) do nothing;

-- ---------- Nota sobre auth/RLS ----------
-- App personal sin login: acceso solo server-side (Nuxt Nitro) con la API key.
-- Al añadir auth: agregar user_id uuid references auth.users(id) a cada tabla,
-- luego enable row level security + políticas using (auth.uid() = user_id).
