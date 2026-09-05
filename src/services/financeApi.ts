import {
  cashHistory,
  cashOnHand,
  company,
  currentUser,
  exceptions,
  expenses,
  invoices,
  netBurn30d,
  transactions,
  vendors,
} from '../data/mockData';
import type {
  CashPoint,
  Company,
  Exception,
  Expense,
  Invoice,
  Metric,
  Transaction,
  UserProfile,
  Vendor,
} from '../types';
import { formatMoneyCompact } from '../utils/format';

/* ---------------------------------------------------------------------------
   The one place the UI reads data from.

   These are deliberately synchronous while everything is mock data — no
   loading states to thread through the pages yet. When a real backend lands,
   each function becomes an async fetch and only this file plus the call sites'
   await keywords change. Pages never import from src/data directly.
--------------------------------------------------------------------------- */

/** The tenant the shell is showing. Comes from the session once auth lands. */
export function getCompany(): Company {
  return company;
}

/** The signed-in person. Also session-derived later. */
export function getCurrentUser(): UserProfile {
  return currentUser;
}

export function listTransactions(): Transaction[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
}

export function listRecentTransactions(count = 5): Transaction[] {
  return listTransactions().slice(0, count);
}

export function listInvoices(): Invoice[] {
  return [...invoices].sort((a, b) => b.issuedOn.localeCompare(a.issuedOn));
}

export function findInvoiceById(identifier?: string | null): Invoice | undefined {
  if (!identifier) return undefined;

  const target = identifier.trim();
  if (!target) return undefined;

  const normalized = target.toLowerCase();
  return listInvoices().find(
    (invoice) =>
      invoice.id.toLowerCase() === normalized ||
      invoice.number.toLowerCase() === normalized,
  );
}

export function listVendors(): Vendor[] {
  return [...vendors].sort((a, b) => b.spendYtd - a.spendYtd);
}

export function listExpenses(): Expense[] {
  return [...expenses].sort((a, b) => b.date.localeCompare(a.date));
}

export function listExceptions(): Exception[] {
  const weight = { critical: 0, high: 1, medium: 2, low: 3 } as const;
  return [...exceptions].sort((a, b) => weight[a.severity] - weight[b.severity]);
}

/** Drives the header notification badge. Real count, not a decorative dot. */
export function countOpenExceptions(): number {
  return exceptions.length;
}

export function listCashHistory(): CashPoint[] {
  return cashHistory;
}

export function getCashOnHand(): number {
  return cashOnHand;
}

/** Outstanding balance on invoices that are past their due date. */
export function getOverdueReceivables(): number {
  return invoices
    .filter((invoice) => invoice.status === 'overdue' || invoice.status === 'disputed')
    .reduce((total, invoice) => total + (invoice.amount - invoice.amountPaid), 0);
}

/** Bank lines the matcher could not tie to a document. */
export function listUnreconciledLines(): Transaction[] {
  return listTransactions().filter(
    (txn) => txn.status === 'unmatched' || txn.status === 'pending',
  );
}

export function countUnreconciledLines(): number {
  return listUnreconciledLines().length;
}

/** Months of runway at the current burn, or null if the business is cash positive. */
export function getRunwayMonths(): number | null {
  if (netBurn30d <= 0) return null;
  return Math.round((cashOnHand / netBurn30d) * 10) / 10;
}

/** The ruled figure strip on the dashboard. */
export function getHeadlineMetrics(): Metric[] {
  const runway = getRunwayMonths();

  return [
    {
      id: 'cash-on-hand',
      label: 'Cash on hand',
      value: formatMoneyCompact(cashOnHand),
      note: 'Across 2 operating accounts',
    },
    {
      id: 'net-burn',
      label: 'Net burn, 30 days',
      value: formatMoneyCompact(netBurn30d),
      note: runway === null ? 'Cash positive' : `${runway} months of runway`,
      tone: 'negative',
    },
    {
      id: 'overdue-ar',
      label: 'Overdue receivables',
      value: formatMoneyCompact(getOverdueReceivables()),
      note: '2 customers past terms',
      tone: 'negative',
    },
    {
      id: 'unreconciled',
      label: 'Unreconciled lines',
      value: String(countUnreconciledLines()),
      note: 'August close is still open',
      tone: 'warning',
    },
  ];
}
