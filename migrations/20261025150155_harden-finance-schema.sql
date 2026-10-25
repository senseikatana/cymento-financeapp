-- ============================================================
--  cymento-financeapp · endurecimiento del esquema (segunda pasada)
--  Aplica hallazgos de revisión: fechas DATE, vigencia, grants, checks
-- ============================================================

-- ---------- 1. Seguridad: sin acceso directo vía anon/authenticated ----------
-- El backend solo accede con la API key admin (server-side). Al añadir auth,
-- conceder de nuevo solo a authenticated y crear políticas RLS antes.
revoke all on table
  public.incomes,
  public.expenses,
  public.subscriptions,
  public.settings
from anon, authenticated;

-- ---------- 2. Fechas de calendario como DATE (no timestamptz) ----------
alter table public.incomes
  alter column "date" type date using ("date" at time zone 'Europe/Madrid')::date,
  alter column "date" set default (now() at time zone 'Europe/Madrid')::date;

alter table public.expenses
  alter column "date" type date using ("date" at time zone 'Europe/Madrid')::date,
  alter column "date" set default (now() at time zone 'Europe/Madrid')::date;

alter table public.subscriptions
  alter column start_date type date using (start_date at time zone 'Europe/Madrid')::date,
  alter column renewal_date type date using (renewal_date at time zone 'Europe/Madrid')::date,
  alter column start_date set default (now() at time zone 'Europe/Madrid')::date;

-- ---------- 3. Vigencia de gastos recurrentes ----------
alter table public.expenses
  add column if not exists active boolean not null default true;

-- ---------- 4. Importes positivos y textos no vacíos ----------
alter table public.incomes
  drop constraint if exists incomes_amount_check,
  add constraint incomes_amount_positive check (amount > 0),
  add constraint incomes_source_not_blank check (btrim(source) <> '');

alter table public.expenses
  drop constraint if exists expenses_amount_check,
  add constraint expenses_amount_positive check (amount > 0),
  add constraint expenses_description_not_blank check (btrim(description) <> '');

alter table public.subscriptions
  drop constraint if exists subscriptions_amount_check,
  add constraint subscriptions_amount_positive check (amount > 0),
  add constraint subscriptions_name_not_blank check (btrim(name) <> ''),
  add constraint subscriptions_renewal_after_start
    check (renewal_date is null or renewal_date >= start_date);

-- ---------- 5. settings: garantizar singleton ----------
alter table public.settings
  add constraint settings_singleton check (id = 'singleton');

-- ---------- 6. Índices: quitar los de baja utilidad, añadir compuesto ----------
drop index if exists public.idx_incomes_active;
drop index if exists public.idx_subscriptions_active;
drop index if exists public.idx_subscriptions_renewal;
drop index if exists public.idx_expenses_bucket;

create index if not exists idx_expenses_bucket_date
  on public.expenses (bucket, date desc);

create index if not exists idx_expenses_active_date
  on public.expenses (active, date desc) where active;

-- ---------- 7. Endurecer set_updated_at ----------
alter function public.set_updated_at()
  set search_path = pg_catalog, public;
