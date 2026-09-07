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
import {
  ALL_RISK_TYPES,
  ALL_SEVERITIES,
  centralizedRisks,
  getCentralizedRiskSummary,
  type RiskSummaryCounts,
} from '../data/risks';
import type { DashboardKpi } from '../data/dashboardTypes';
import type {
  CashPoint,
  CentralizedRisk,
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

let invoiceList: Invoice[] = [...invoices];

export function listInvoices(): Invoice[] {
  return [...invoiceList].sort((a, b) => b.issuedOn.localeCompare(a.issuedOn));
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

export function updateInvoice(id: string, updates: Partial<Invoice>): Invoice | undefined {
  const target = findInvoiceById(id);
  if (!target) return undefined;
  invoiceList = invoiceList.map((inv) =>
    inv.id === target.id || inv.number.toLowerCase() === target.number.toLowerCase()
      ? { ...inv, ...updates }
      : inv,
  );
  return findInvoiceById(id);
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

/** Centralized risk dataset accessors for Risk Center */
export function listCentralizedRisks(): CentralizedRisk[] {
  return [...centralizedRisks];
}

export function getRiskSummaryCounts(items?: CentralizedRisk[]): RiskSummaryCounts {
  return getCentralizedRiskSummary(items);
}

export { ALL_RISK_TYPES, ALL_SEVERITIES };

export function listCashHistory(): CashPoint[] {
  return cashHistory;
}

export function getCashOnHand(): number {
  return cashOnHand;
}

/** Outstanding balance on invoices that are past their due date. */
export function getOverdueReceivables(): number {
  return listInvoices()
    .filter((invoice) => invoice.status === 'overdue' || invoice.status === 'disputed')
    .reduce((total, invoice) => total + (invoice.amount - invoice.amountPaid), 0);
}

/** Outstanding balance across all unpaid invoices. */
export function getOutstandingReceivables(): number {
  return listInvoices()
    .filter((invoice) => invoice.status !== 'paid')
    .reduce((total, invoice) => total + (invoice.amount - invoice.amountPaid), 0);
}

export function getOutstandingInvoiceCount(): number {
  return listInvoices().filter((invoice) => invoice.status !== 'paid').length;
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

/** The primary KPIs displayed on the overview dashboard. */
export function getDashboardKpis(): DashboardKpi[] {
  const outstandingAmount = getOutstandingReceivables();
  const outstandingCount = getOutstandingInvoiceCount();

  return [
    { label: 'Available Cash', value: formatMoneyCompact(cashOnHand), trend: '+8.4%', comparison: 'vs last month', tone: 'teal' },
    { label: 'Revenue', value: '₹20.4L', trend: '+12.8%', comparison: 'vs last month', tone: 'blue' },
    { label: 'Expenses', value: '₹14.1L', trend: '+4.2%', comparison: 'vs last month', tone: 'amber' },
    { label: 'Outstanding', value: formatMoneyCompact(outstandingAmount), trend: String(outstandingCount), comparison: 'unpaid invoices', tone: 'coral' },
  ];
}

