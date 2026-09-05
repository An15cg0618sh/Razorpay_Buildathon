import type { Money } from '../types';

/* Change these two lines to move the whole app to another currency. */
export const LOCALE = 'en-IN';
export const CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

const fullMoney = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeMoney = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

/** ₹42,300.00 — Indian digit grouping, always two decimals. */
export function formatMoney(amount: Money): string {
  return fullMoney.format(amount);
}

/** ₹42,300 — for figures where paise are noise. */
export function formatMoneyWhole(amount: Money): string {
  return wholeMoney.format(amount);
}

/**
 * Lakh / crore short form, written out rather than left to Intl so the
 * output is identical in every browser: ₹1.24 Cr, ₹18.6 L, ₹9,400.
 */
export function formatMoneyCompact(amount: Money): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);

  if (abs >= 1_00_00_000) {
    return `${sign}${CURRENCY_SYMBOL}${(abs / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}${CURRENCY_SYMBOL}${(abs / 1_00_000).toFixed(1)} L`;
  }
  return `${sign}${wholeMoney.format(abs)}`;
}

/** Prefixes an outflow with a minus so the ledger reads correctly. */
export function formatSignedMoney(amount: Money, direction: 'inflow' | 'outflow'): string {
  return direction === 'outflow' ? `-${formatMoney(amount)}` : formatMoney(amount);
}

const dayMonthYear = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** "12 Aug 2026". Returns the raw string if the date can't be parsed. */
export function formatDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? iso : dayMonthYear.format(parsed);
}

/** Whole days between `iso` and `today`. Negative means `iso` is in the past. */
export function daysUntil(iso: string, today = new Date()): number {
  const target = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 0;

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - startOfToday.getTime()) / msPerDay);
}

/** "due in 6 days" / "12 days overdue" / "due today". */
export function describeDueDate(iso: string, today = new Date()): string {
  const days = daysUntil(iso, today);
  if (days === 0) return 'due today';
  if (days > 0) return `due in ${days} ${days === 1 ? 'day' : 'days'}`;
  const overdue = Math.abs(days);
  return `${overdue} ${overdue === 1 ? 'day' : 'days'} overdue`;
}

/** Turns a route path into the label shown in the header, e.g. "/cash-flow" → "Cash flow". */
export function titleFromPath(path: string): string {
  const slug = path.replace(/^\/+/, '').split('/')[0];
  if (!slug) return 'Dashboard';
  const spaced = slug.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
