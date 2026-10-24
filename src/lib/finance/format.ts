// Helpers de formato monetario y de fechas en español
export function formatEUR(amount: number, locale = 'es-ES'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

export function formatNumber(amount: number, locale = 'es-ES'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

export function formatDate(date: Date | string, locale = 'es-ES'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatDateInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 10)
}

// Colores de los tres buckets (sin indigo/blue para cumplir con la guía de estilo)
export const BUCKET_COLORS = {
  fijo: '#10b981',         // emerald
  extraordinario: '#f59e0b', // amber
  ahorro: '#8b5cf6',       // violet (no es indigo)
}

export const BUCKET_LABELS: Record<string, string> = {
  fijo: 'Fijos (50%)',
  extraordinario: 'Extraordinarios (30%)',
  ahorro: 'Ahorro (20%)',
}

export const BUCKET_SHORT: Record<string, string> = {
  fijo: 'Fijos',
  extraordinario: 'Extras',
  ahorro: 'Ahorro',
}

export const FREQUENCY_LABELS: Record<string, string> = {
  unico: 'Único',
  mensual: 'Mensual',
  anual: 'Anual',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
}

export const INCOME_TYPE_LABELS: Record<string, string> = {
  salario: 'Salario',
  subsidio_paro: 'Subsidio paro',
  ahorros_previos: 'Ahorros previos',
  otro: 'Otro',
}

// Convierte una cantidad según frecuencia a su equivalente mensual
export function toMonthly(amount: number, freq: string): number {
  switch (freq) {
    case 'mensual': return amount
    case 'anual': return amount / 12
    case 'trimestral': return amount / 3
    case 'semestral': return amount / 6
    case 'unico': return 0
    default: return amount
  }
}

export function toYearly(amount: number, freq: string): number {
  switch (freq) {
    case 'mensual': return amount * 12
    case 'anual': return amount
    case 'trimestral': return amount * 4
    case 'semestral': return amount * 2
    case 'unico': return amount
    default: return amount * 12
  }
}
