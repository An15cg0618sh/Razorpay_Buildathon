import { CheckCircle2, CircleDashed, Play, Sparkles, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Panel } from '../components/Panel';
import { PageHeading } from '../components/PageHeading';
import { StatusPill } from '../components/StatusPill';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { reconciliationResults, reconciliationSummary } from '../data/mockData';
import type { ReconciliationResult } from '../types';
import { formatDate, formatMoney } from '../utils/format';
import {
  calculateMatchScore,
  classifyReconciliationResult,
  getResultExplanation,
} from '../services/reconciliation';

const stages = [
  'Analyzing transactions...',
  'Matching vendors...',
  'Comparing amounts...',
  'Checking dates...',
  'Detecting duplicates...',
  'Calculating confidence...',
] as const;

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'strong-match', label: 'Strong Match' },
  { value: 'review', label: 'Review' },
  { value: 'unmatched', label: 'Unmatched' },
  { value: 'possible-duplicate', label: 'Possible Duplicate' },
] as const;

function toneFor(status: string) {
  switch (status) {
    case 'Strong Match':
      return 'positive';
    case 'Review':
      return 'warning';
    case 'Unmatched':
      return 'negative';
    case 'Possible Duplicate':
      return 'negative';
    default:
      return 'neutral';
  }
}

const filterStatuses: Record<(typeof filterOptions)[number]['value'], string | null> = {
  all: null,
  'strong-match': 'Strong Match',
  review: 'Review',
  unmatched: 'Unmatched',
  'possible-duplicate': 'Possible Duplicate',
};

export function Reconciliation() {
  useDocumentTitle('Reconciliation');
  const [processing, setProcessing] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [filter, setFilter] = useState<(typeof filterOptions)[number]['value']>('all');
  const [results, setResults] = useState<ReconciliationResult[]>(reconciliationResults);

  useEffect(() => {
    if (!processing) return;

    const timers = stages.map((_, index) =>
      window.setTimeout(() => setActiveStage(index), index * 420),
    );

    const finish = window.setTimeout(() => {
      setResults(reconciliationResults);
      setProcessing(false);
      setActiveStage(stages.length - 1);
    }, stages.length * 420 + 120);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(finish);
    };
  }, [processing]);

  const normalizedResults = useMemo(() => {
    return results.map((item) => {
      const score = calculateMatchScore({
        vendorA: item.vendor,
        vendorB: item.vendor,
        amountA: item.transactionAmount,
        amountB: item.invoiceAmount,
        dateA: item.transactionDate,
        dateB: item.invoiceDate,
      });

      const vendorScore = 100;
      const amountScore = Math.max(0, 100 - Math.abs(item.transactionAmount - item.invoiceAmount) / Math.max(item.invoiceAmount, 1) * 100);
      const dateScore = Math.max(0, 100 - Math.abs(new Date(`${item.transactionDate}T00:00:00`).getTime() - new Date(`${item.invoiceDate}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24) * 4);

      return {
        ...item,
        matchScore: score,
        status: classifyReconciliationResult(item),
        explanation: item.explanation || getResultExplanation(item.resultType),
        vendorScore,
        amountScore: Math.min(100, Math.max(0, amountScore)),
        dateScore: Math.min(100, Math.max(0, dateScore)),
      };
    });
  }, [results]);

  const visibleResults = useMemo(() => {
    return normalizedResults.filter((item) => filterStatuses[filter] === null || filterStatuses[filter] === item.status);
  }, [filter, normalizedResults]);

  const runReconciliation = () => {
    if (processing) return;
    setActiveStage(0);
    setProcessing(true);
  };

  return (
    <>
      <PageHeading
        title="AI Reconciliation"
        lede="Automatically match bank transactions with invoices."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-line bg-panel p-4 shadow-card">
          <p className="text-xs uppercase tracking-[0.08em] text-steel">Matched</p>
          <p className="mt-3 figure text-2xl font-semibold text-navy">{reconciliationSummary.matched}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4 shadow-card">
          <p className="text-xs uppercase tracking-[0.08em] text-steel">Mismatched</p>
          <p className="mt-3 figure text-2xl font-semibold text-navy">{reconciliationSummary.mismatched}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4 shadow-card">
          <p className="text-xs uppercase tracking-[0.08em] text-steel">Unmatched</p>
          <p className="mt-3 figure text-2xl font-semibold text-navy">{reconciliationSummary.unmatched}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4 shadow-card">
          <p className="text-xs uppercase tracking-[0.08em] text-steel">Possible Duplicates</p>
          <p className="mt-3 figure text-2xl font-semibold text-navy">{reconciliationSummary.possibleDuplicates}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={runReconciliation}
          disabled={processing}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Play className="h-4 w-4" />
          {processing ? 'Processing...' : 'Run Reconciliation'}
        </button>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                filter === option.value
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line bg-panel text-steel hover:bg-subtle'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {processing && (
        <div className="mb-6 rounded-lg border border-line bg-panel p-5 shadow-card">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-semibold text-navy">AI Reconciliation</p>
              <p className="text-sm text-steel">{stages[activeStage] ?? 'Calculating confidence...'}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {stages.map((stage, index) => {
              const complete = index < activeStage;
              const current = index === activeStage;
              return (
                <div key={stage} className="flex items-center gap-3 text-sm">
                  {complete ? (
                    <CheckCircle2 className="h-4 w-4 text-positive" />
                  ) : current ? (
                    <CircleDashed className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-mist" />
                  )}
                  <span className={complete ? 'text-positive' : current ? 'text-primary' : 'text-steel'}>{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!processing && visibleResults.length === 0 && (
        <div className="rounded-lg border border-dashed border-line bg-panel p-8 text-center text-sm text-steel">
          No reconciliation results found.
        </div>
      )}

      {!processing && (
        <div className="space-y-4">
          {visibleResults.map((result) => {
            const statusTone = toneFor(result.status ?? '');
            const amountDifference = Math.abs(result.transactionAmount - result.invoiceAmount);

            return (
              <Panel key={result.id} title={result.status} description={result.vendor} flush>
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="section-kicker">{result.vendor}</p>
                      <p className="mt-1 text-base font-semibold text-navy">{result.status}</p>
                    </div>
                    <StatusPill tone={statusTone}>{result.status}</StatusPill>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-md border border-line bg-subtle p-4">
                      <p className="text-xs uppercase tracking-[0.08em] text-mist">Bank Transaction</p>
                      <div className="mt-3 space-y-2 text-sm text-navy">
                        <p className="font-medium">{result.vendor}</p>
                        <p className="figure">{formatMoney(result.transactionAmount)}</p>
                        <p>{formatDate(result.transactionDate)}</p>
                      </div>
                    </div>

                    <div className="rounded-md border border-line bg-subtle p-4">
                      <p className="text-xs uppercase tracking-[0.08em] text-mist">Invoice</p>
                      <div className="mt-3 space-y-2 text-sm text-navy">
                        <p className="font-medium">{result.invoiceId}</p>
                        <p className="font-medium">{result.vendor}</p>
                        <p className="figure">{formatMoney(result.invoiceAmount)}</p>
                        <p>{formatDate(result.invoiceDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-line bg-subtle p-4">
                    <div className="flex items-center justify-between gap-3 text-sm text-steel">
                      <span>Match Score</span>
                      <span className="figure font-semibold text-navy">{Math.round(result.matchScore ?? 0)}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full rounded-full ${
                          result.resultType === 'strong-match'
                            ? 'bg-positive'
                            : result.resultType === 'review'
                              ? 'bg-warning'
                              : result.resultType === 'possible-duplicate'
                                ? 'bg-warning'
                                : 'bg-negative'
                        }`}
                        style={{ width: `${Math.round(result.matchScore ?? 0)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-md border border-line bg-panel p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-mist">Vendor</p>
                      <p className="mt-2 figure text-sm text-navy">{Math.round(result.vendorScore ?? 0)}%</p>
                    </div>
                    <div className="rounded-md border border-line bg-panel p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-mist">Amount</p>
                      <p className="mt-2 figure text-sm text-navy">{Math.round(result.amountScore ?? 0)}%</p>
                    </div>
                    <div className="rounded-md border border-line bg-panel p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-mist">Date</p>
                      <p className="mt-2 figure text-sm text-navy">{Math.round(result.dateScore ?? 0)}%</p>
                    </div>
                    <div className="rounded-md border border-line bg-panel p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-mist">Difference</p>
                      <p className="mt-2 figure text-sm text-navy">{formatMoney(amountDifference)}</p>
                    </div>
                  </div>

                  <div className="rounded-md border border-line bg-subtle p-4">
                    <p className="text-sm font-medium text-navy">Validation details</p>
                    <ul className="mt-3 space-y-2 text-sm text-steel">
                      <li className="flex items-center gap-2">
                        {result.resultType === 'unmatched' ? (
                          <XCircle className="h-4 w-4 text-negative" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-positive" />
                        )}
                        {result.resultType === 'strong-match'
                          ? '✓ Vendor match'
                          : result.resultType === 'review'
                            ? '✓ Vendor match'
                            : result.resultType === 'possible-duplicate'
                              ? '⚠ Similar vendor and amount pattern'
                              : '✗ No matching invoice identified'}
                      </li>
                      <li className="flex items-center gap-2">
                        {result.resultType === 'unmatched' ? (
                          <XCircle className="h-4 w-4 text-negative" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-positive" />
                        )}
                        {result.resultType === 'strong-match'
                          ? '✓ Amount match'
                          : result.resultType === 'review'
                            ? '⚠ Amount mismatch detected'
                            : '✗ Amount mismatch'}
                      </li>
                      <li className="flex items-center gap-2">
                        {result.resultType === 'unmatched' ? (
                          <XCircle className="h-4 w-4 text-negative" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-positive" />
                        )}
                        {result.resultType === 'strong-match'
                          ? '✓ Date within acceptable range'
                          : result.resultType === 'review'
                            ? '⚠ Date is outside the preferred window'
                            : '✗ Date not aligned with a known invoice'}
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-md border border-line bg-panel p-3 text-sm text-steel">
                    <span className="font-medium text-navy">Explanation:</span> {result.explanation}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}
