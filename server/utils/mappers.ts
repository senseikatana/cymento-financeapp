// Traducción entre filas Postgres (snake_case) y el shape que consume el frontend (camelCase)

type Row = Record<string, any>;

export function mapIncome(r: Row) {
  return {
    id: r.id,
    type: r.type,
    source: r.source,
    amount: Number(r.amount),
    frequency: r.frequency,
    date: r.date,
    active: r.active,
    notes: r.notes,
    category: r.category,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function mapSubscription(r: Row) {
  return {
    id: r.id,
    name: r.name,
    provider: r.provider,
    billingCycle: r.billing_cycle,
    amount: Number(r.amount),
    startDate: r.start_date,
    renewalDate: r.renewal_date,
    active: r.active,
    bucket: r.bucket,
    category: r.category,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function mapExpense(r: Row) {
  const rawSub = r.subscription ?? r.subscriptions ?? null;
  const subscription = Array.isArray(rawSub) ? (rawSub[0] ?? null) : rawSub;
  return {
    id: r.id,
    bucket: r.bucket,
    category: r.category,
    description: r.description,
    amount: Number(r.amount),
    frequency: r.frequency,
    date: r.date,
    notes: r.notes,
    active: r.active,
    subscriptionId: r.subscription_id,
    subscription: subscription ? mapSubscription(subscription) : null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function mapSettings(r: Row) {
  return {
    id: r.id,
    pctFixed: Number(r.pct_fixed),
    pctExtra: Number(r.pct_extra),
    pctSavings: Number(r.pct_savings),
    ruleBase: r.rule_base,
    currency: r.currency,
    locale: r.locale,
    updatedAt: r.updated_at,
  };
}

// Fecha de calendario → 'YYYY-MM-DD' en hora local (evita saltos de día por UTC)
export function toDateOnly(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Fecha (string ISO o Date) → 'YYYY-MM-DD' para las hojas Excel
export function isoDay(value: string | Date): string {
  return toDateOnly(value) ?? '';
}
