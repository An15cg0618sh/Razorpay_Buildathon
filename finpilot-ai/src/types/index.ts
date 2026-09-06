import type { LucideIcon } from 'lucide-react';

/* ---------------------------------------------------------------------------
   Domain types.

   These are the contracts the rest of the app builds against. Right now they
   are satisfied by the mock records in src/data; when a real API arrives the
   types stay put and only src/services changes.
--------------------------------------------------------------------------- */

/** Money is stored as a plain number in the smallest sensible unit for
 *  display (rupees, two decimals) — not paise. Formatting lives in
 *  src/utils/format.ts so the whole app agrees on one representation. */
export type Money = number;

export type Tone = 'neutral' | 'positive' | 'negative' | 'warning';

/* --- Transactions -------------------------------------------------------- */

export type TransactionDirection = 'inflow' | 'outflow';

export type TransactionStatus = 'cleared' | 'pending' | 'unmatched';

export interface Transaction {
  id: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  description: string;
  counterparty: string;
  /** Masked bank account the line hit, e.g. "HDFC ••4821". */
  account: string;
  category: string;
  direction: TransactionDirection;
  /** Always positive. `direction` carries the sign. */
  amount: Money;
  status: TransactionStatus;
}

/* --- Invoices ------------------------------------------------------------ */

export type InvoiceStatus = 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'disputed' | 'flagged';

export type InvoiceRisk = 'low' | 'medium' | 'high' | 'critical';

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  issuedOn: string;
  dueOn: string;
  amount: Money;
  amountPaid: Money;
  status: InvoiceStatus;
  risk: InvoiceRisk;
}

/* --- Vendors ------------------------------------------------------------- */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  /** Person in the business who owns the relationship. */
  owner: string;
  spendYtd: Money;
  paymentTermsDays: number;
  risk: RiskLevel;
  onboardedOn: string;
}

/* --- Expenses ------------------------------------------------------------ */

export type ExpenseStatus = 'submitted' | 'approved' | 'reimbursed' | 'flagged';

export interface Expense {
  id: string;
  submittedBy: string;
  date: string;
  merchant: string;
  category: string;
  amount: Money;
  status: ExpenseStatus;
  hasReceipt: boolean;
}

/* --- Exceptions ---------------------------------------------------------- */

export type ExceptionKind =
  | 'duplicate-invoice'
  | 'unmatched-payment'
  | 'missing-receipt'
  | 'terms-breach'
  | 'cash-shortfall';

/** One item in the controller's decision queue — the thing FinPilot exists
 *  to surface. `href` points at the page where it gets resolved. */
export interface Exception {
  id: string;
  kind: ExceptionKind;
  title: string;
  subject: string;
  reason: string;
  amount: Money | null;
  raisedOn: string;
  severity: RiskLevel;
  href: string;
}

/* --- Summary figures ----------------------------------------------------- */

export interface Metric {
  id: string;
  label: string;
  value: string;
  note: string;
  tone?: Tone;
}

/** One month of net cash movement, used by the bar strip. */
export interface CashPoint {
  month: string;
  inflow: Money;
  outflow: Money;
}

/* --- Organisation -------------------------------------------------------- */

/** The tenant the shell is currently showing. One company per session until
 *  multi-entity support arrives. */
export interface Company {
  name: string;
  /** Two or three letters for the header badge. */
  initials: string;
  financialYear: string;
  openPeriod: string;
  bankAccounts: string[];
}

/** The signed-in person. Hard-coded until the auth backend lands, at which
 *  point this comes from the session rather than src/data. */
export interface UserProfile {
  name: string;
  role: string;
  initials: string;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  owner: string;
  creditLimit: Money;
  paymentTermsDays: number;
  city: string;
}

export type PurchaseOrderStatus = 'open' | 'partially-received' | 'closed' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  number: string;
  vendor: string;
  issuedOn: string;
  expectedOn: string;
  amount: Money;
  invoicedAmount: Money;
  status: PurchaseOrderStatus;
}

export type RiskEventLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RiskEvent {
  id: string;
  level: RiskEventLevel;
  title: string;
  entity: string;
  amount: Money;
  detectedOn: string;
  description: string;
  status: 'open' | 'reviewing' | 'resolved';
}

/* --- Centralized Risk Center Types ---------------------------------------- */

export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type RiskType =
  | 'Duplicate Payment'
  | 'Unusual Transaction'
  | 'PO/Invoice Mismatch'
  | 'New Vendor'
  | 'Unusual Frequency'
  | 'Delayed Payment'
  | 'Cash Flow Risk';

export type RiskStatus = 'Open' | 'Under Review' | 'Resolved' | 'Dismissed';

export interface RelatedTransaction {
  id: string;
  reference: string;
  date: string;
  description: string;
  amount: Money;
  counterparty: string;
  account: string;
}

export interface RelatedInvoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: Money;
  customerOrVendor: string;
  status: string;
}

export interface CentralizedRisk {
  id: string;
  severity: RiskSeverity;
  riskType: RiskType;
  vendor: string;
  amount: Money;
  riskScore: number;
  explanation: string;
  status: RiskStatus;
  detectedDate: string;
  whyDetected: string;
  recommendedAction: string;
  relatedTransaction?: RelatedTransaction;
  relatedInvoice?: RelatedInvoice;
}

export interface DailyCashFlow {
  date: string;
  inflow: Money;
  outflow: Money;
  closingBalance: Money;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdOn: string;
  href: string;
  read: boolean;
}

export type ReconciliationResultType = 'strong-match' | 'review' | 'unmatched' | 'possible-duplicate';

export interface ReconciliationResult {
  id: string;
  vendor: string;
  invoiceId: string;
  resultType: ReconciliationResultType;
  invoiceAmount: number;
  transactionAmount: number;
  invoiceDate: string;
  transactionDate: string;
  explanation?: string;
  matchScore?: number;
  status?: string;
  vendorScore?: number;
  amountScore?: number;
  dateScore?: number;
}

/* --- Navigation ---------------------------------------------------------- */

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Short line shown in the mobile drawer and as a title attribute. */
  hint: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
