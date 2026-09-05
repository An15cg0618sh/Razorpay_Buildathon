import type { ReconciliationResult, ReconciliationResultType } from '../types';

export type { ReconciliationResultType } from '../types';

export type ReconciliationClassification =
  | 'Strong Match'
  | 'Review'
  | 'Unmatched'
  | 'Possible Duplicate';

export interface ReconciliationInputs {
  vendorA: string;
  vendorB: string;
  amountA: number;
  amountB: number;
  dateA: string;
  dateB: string;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function normalize(text: string): string {
  return String(text ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function vendorSimilarity(vendorA: string, vendorB: string): number {
  const a = normalize(vendorA);
  const b = normalize(vendorB);

  if (!a || !b) return 0;
  if (a === b) return 100;

  const aWords = new Set(a.split(' '));
  const bWords = new Set(b.split(' '));
  const overlap = [...aWords].filter((word) => bWords.has(word)).length;
  const maxWords = Math.max(aWords.size, bWords.size, 1);
  const tokenOverlap = (overlap / maxWords) * 100;

  if (a.includes(b) || b.includes(a)) return 80;
  return clamp(tokenOverlap, 0, 100);
}

export function amountSimilarity(amountA: number, amountB: number): number {
  const a = Number.isFinite(amountA) ? Math.abs(amountA) : 0;
  const b = Number.isFinite(amountB) ? Math.abs(amountB) : 0;
  const bigger = Math.max(a, b, 1);
  const difference = Math.abs(a - b);

  if (a === 0 && b === 0) return 100;
  if (difference === 0) return 100;

  const ratio = (1 - difference / bigger) * 100;
  return clamp(ratio, 0, 100);
}

export function dateProximity(dateA: string, dateB: string): number {
  const first = safeDate(dateA);
  const second = safeDate(dateB);

  if (!first || !second) return 0;

  const diffDays = Math.abs((first.getTime() - second.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 100;

  const score = 100 - diffDays * 10;
  return clamp(score, 0, 100);
}

export function calculateMatchScore({ vendorA, vendorB, amountA, amountB, dateA, dateB }: ReconciliationInputs): number {
  const vendor = vendorSimilarity(vendorA, vendorB);
  const amount = amountSimilarity(amountA, amountB);
  const date = dateProximity(dateA, dateB);

  const score = vendor * 0.4 + amount * 0.4 + date * 0.2;
  return clamp(score, 0, 100);
}

export function getMatchClassification(score: number, resultType?: ReconciliationResultType): ReconciliationClassification {
  if (resultType === 'possible-duplicate') return 'Possible Duplicate';
  if (resultType === 'unmatched') return 'Unmatched';
  if (score >= 90) return 'Strong Match';
  if (score >= 70) return 'Review';
  return 'Unmatched';
}

export function classifyReconciliationResult(result: ReconciliationResult): ReconciliationClassification {
  const score = calculateMatchScore({
    vendorA: result.vendor,
    vendorB: result.vendor,
    amountA: result.transactionAmount,
    amountB: result.invoiceAmount,
    dateA: result.transactionDate,
    dateB: result.invoiceDate,
  });

  return getMatchClassification(score, result.resultType);
}

export function getResultExplanation(resultType: ReconciliationResultType): string {
  switch (resultType) {
    case 'strong-match':
      return 'Vendor, amount, and transaction date are consistent with the invoice.';
    case 'review':
      return 'Amount mismatch detected between the bank transaction and invoice.';
    case 'unmatched':
      return 'No corresponding invoice was identified for this transaction.';
    case 'possible-duplicate':
      return 'This transaction appears similar to another transaction and requires review.';
    default:
      return 'Review the transaction manually before approving the match.';
  }
}
