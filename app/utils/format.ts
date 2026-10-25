import type { Locale } from 'katanakit-js';
// Helpers de formato monetario y de fechas en español — delegan en katanakit-js
import { useFormat, useFormatCurrency, useFormatNumber } from 'katanakit-js';

const LOCALE: Locale = 'es';

export function formatEUR(amount: number, locale: Locale = LOCALE): string {
  return useFormatCurrency({ amount: amount || 0, currency: 'EUR', locale });
}

export function formatNumber(amount: number, locale: Locale = LOCALE): string {
  return useFormatNumber(amount || 0, locale, 2);
}

export function formatDate(
  date: Date | string | null | undefined,
  locale: Locale = LOCALE
): string {
  if (!date) return '—';
  try {
    // 'YYYY-MM-DD' se pasa como PlainDate (sin zona); los ISO con hora, como Date.
    const input =
      typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : typeof date === 'string'
          ? new Date(date)
          : date;
    return useFormat(input, locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatDateInput(date: Date | string): string {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10);
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Colores de los tres buckets (sin indigo/blue para cumplir con la guía de estilo)
export const BUCKET_COLORS: Record<string, string> = {
  fijo: '#10b981', // emerald
  extraordinario: '#f59e0b', // amber
  ahorro: '#8b5cf6', // violet
};

export const BUCKET_LABELS: Record<string, string> = {
  fijo: 'Fijos (50%)',
  extraordinario: 'Extraordinarios (30%)',
  ahorro: 'Ahorro (20%)',
};

export const BUCKET_SHORT: Record<string, string> = {
  fijo: 'Fijos',
  extraordinario: 'Extras',
  ahorro: 'Ahorro',
};

export const FREQUENCY_LABELS: Record<string, string> = {
  unico: 'Único',
  mensual: 'Mensual',
  anual: 'Anual',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
};

export const INCOME_TYPE_LABELS: Record<string, string> = {
  salario: 'Salario',
  subsidio_paro: 'Subsidio paro',
  ahorros_previos: 'Ahorros previos',
  otro: 'Otro',
};

// Convierte una cantidad según frecuencia a su equivalente mensual
export function toMonthly(amount: number, freq: string): number {
  switch (freq) {
    case 'mensual':
      return amount;
    case 'anual':
      return amount / 12;
    case 'trimestral':
      return amount / 3;
    case 'semestral':
      return amount / 6;
    case 'unico':
      return 0;
    default:
      return amount;
  }
}

export function toYearly(amount: number, freq: string): number {
  switch (freq) {
    case 'mensual':
      return amount * 12;
    case 'anual':
      return amount;
    case 'trimestral':
      return amount * 4;
    case 'semestral':
      return amount * 2;
    case 'unico':
      return amount;
    default:
      return amount * 12;
  }
}
