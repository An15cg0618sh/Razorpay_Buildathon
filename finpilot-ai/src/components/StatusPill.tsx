import type {
  ExpenseStatus,
  InvoiceStatus,
  RiskLevel,
  Tone,
  TransactionStatus,
} from '../types';
import { cn } from '../utils/cn';

export type PillTone = Tone | 'accent';

/* Soft wash + matching text. On a white panel these read as deliberate status
   badges rather than as outlined leftovers. */
const toneClasses: Record<PillTone, string> = {
  neutral: 'border-line bg-subtle text-steel',
  positive: 'border-positive/20 bg-positive-soft text-positive',
  negative: 'border-critical/20 bg-critical-soft text-critical',
  warning: 'border-warning/20 bg-warning-soft text-warning',
  accent: 'border-primary/20 bg-primary-soft text-primary',
};

interface StatusPillProps {
  tone?: PillTone;
  children: string;
  className?: string;
}

/** A small bordered label. Colour is semantic, never decorative. */
export function StatusPill({ tone = 'neutral', children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
    >
      {sentenceCase(children)}
    </span>
  );
}

export function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* Status → tone maps, kept next to the component so the four ledger pages
   all read the same colour language. */

export const transactionStatusTone: Record<TransactionStatus, PillTone> = {
  cleared: 'positive',
  pending: 'warning',
  unmatched: 'negative',
};

export const invoiceStatusTone: Record<InvoiceStatus, PillTone> = {
  draft: 'neutral',
  sent: 'neutral',
  pending: 'warning',
  paid: 'positive',
  overdue: 'negative',
  disputed: 'negative',
  flagged: 'negative',
};

export const expenseStatusTone: Record<ExpenseStatus, PillTone> = {
  submitted: 'neutral',
  approved: 'warning',
  reimbursed: 'positive',
  flagged: 'negative',
};

export const riskTone: Record<RiskLevel, PillTone> = {
  low: 'positive',
  medium: 'neutral',
  high: 'warning',
  critical: 'negative',
};
