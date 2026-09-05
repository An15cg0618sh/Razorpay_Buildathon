import { AlertCircle, CheckCircle2, Download, Minus, Plus, ShieldAlert, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusPill, invoiceStatusTone, riskTone } from '../components/StatusPill';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { findInvoiceById } from '../services/financeApi';
import { purchaseOrders } from '../data/mockData';
import type { Invoice } from '../types';
import { formatDate, formatMoney } from '../utils/format';

const demoAiChecks = [
  { label: 'Vendor verified', ok: true },
  { label: 'Invoice number valid', ok: true },
  { label: 'Amount extracted', ok: true },
  { label: 'Purchase order mismatch detected', ok: false },
] as const;

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(1);
  const [action, setAction] = useState<'approve' | 'flag' | null>(null);
  const [sessionStatus, setSessionStatus] = useState<Invoice['status'] | null>(null);
  const [sessionRisk, setSessionRisk] = useState<Invoice['risk'] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const invoice = useMemo(() => findInvoiceById(id), [id]);
  useDocumentTitle(invoice ? `${invoice.number} · Invoice` : 'Invoice not found');

  if (!invoice) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-line bg-panel p-8 shadow-card">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-critical-soft p-2 text-critical">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="section-kicker">Invoice not found</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Unable to find the requested invoice.</h1>
          </div>
        </div>
        <div className="mt-6 flex justify-start">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  useDocumentTitle(`${invoice.number} · Invoice`);

  const displayStatus = sessionStatus ?? invoice.status;
  const displayRisk = sessionRisk ?? invoice.risk;
  const relatedPo = purchaseOrders.find((po) => po.vendor === invoice.customer) ?? {
    number: 'PO-UNKNOWN',
    amount: invoice.amount,
    vendor: invoice.customer,
    status: 'open',
  };

  const poDifference = invoice.amount - relatedPo.amount;
  const hasMismatch = poDifference !== 0;
  const poStatus = hasMismatch ? 'HIGH RISK — Mismatch detected' : 'MATCHED';
  const poExplanation = hasMismatch
    ? `The invoice exceeds the approved purchase order by ${formatMoney(Math.abs(poDifference))}. Review before approving payment.`
    : 'The invoice matches the approved purchase order amount.';

  const handleConfirm = () => {
    if (action === 'approve') {
      setSessionStatus('paid');
      setSuccessMessage('Invoice approved');
    }

    if (action === 'flag') {
      setSessionStatus('flagged');
      setSessionRisk('high');
      setSuccessMessage('Invoice flagged for review');
    }

    setAction(null);
  };

  const handleCloseAction = () => {
    setAction(null);
  };

  const zoomLabel = `${Math.round(zoom * 100)}%`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
          >
            <span aria-hidden="true">←</span>
            Back to Invoices
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <p className="text-xl font-semibold tracking-tight text-navy">{invoice.number}</p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={invoiceStatusTone[displayStatus]}>{titleCase(displayStatus)}</StatusPill>
            <StatusPill tone={riskTone[displayRisk]}>{`${titleCase(displayRisk)} Risk`}</StatusPill>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_1.42fr]">
        <section className="rounded-lg border border-line bg-panel p-4 shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <div>
              <p className="section-kicker">Invoice PDF</p>
              <h2 className="mt-1 text-lg font-semibold text-navy">Preview</h2>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setZoom((current) => Math.max(0.8, +(current - 0.1).toFixed(2)))} className="rounded-md border border-line px-2 py-1 text-xs font-medium text-steel hover:bg-subtle">
                <span className="inline-flex items-center gap-1"><Minus className="h-3 w-3" />Zoom Out</span>
              </button>
              <span className="text-xs font-medium text-steel">{zoomLabel}</span>
              <button type="button" onClick={() => setZoom((current) => Math.min(1.5, +(current + 0.1).toFixed(2)))} className="rounded-md border border-line px-2 py-1 text-xs font-medium text-steel hover:bg-subtle">
                <span className="inline-flex items-center gap-1"><Plus className="h-3 w-3" />Zoom In</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 text-xs text-steel">
            <button type="button" className="rounded-md border border-line px-2 py-1 hover:bg-subtle">Fit to Width</button>
            <button type="button" className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 hover:bg-subtle">
              <Download className="h-3.5 w-3.5" />Download
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-md border border-line bg-subtle p-4">
            <div
              className="mx-auto w-full max-w-md rounded-md border border-line bg-panel p-4 shadow-sm transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mist">Invoice</p>
                  <p className="mt-2 text-lg font-semibold text-navy">{invoice.number}</p>
                </div>
                <div className="text-right text-xs text-steel">
                  <p>Due {formatDate(invoice.dueOn)}</p>
                  <p className="mt-1 font-medium text-navy">{formatMoney(invoice.amount)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-steel">
                <div className="flex items-center justify-between gap-3">
                  <span>Billed to</span>
                  <span className="text-right font-medium text-navy">{invoice.customer}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Issue date</span>
                  <span className="font-medium text-navy">{formatDate(invoice.issuedOn)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Amount</span>
                  <span className="figure font-medium text-navy">{formatMoney(invoice.amount)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-line bg-subtle p-3">
                <div className="flex items-center justify-between text-xs text-steel">
                  <span>Subtotal</span>
                  <span className="figure text-navy">₹1,16,900</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-steel">
                  <span>GST</span>
                  <span className="figure text-navy">₹8,100</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-sm font-semibold text-navy">
                  <span>Total</span>
                  <span className="figure">{formatMoney(invoice.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-lg border border-line bg-panel p-5 shadow-card">
            <h2 className="text-lg font-semibold text-navy">Invoice Details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Invoice Number</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{invoice.number}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Status</dt>
                <dd className="mt-1"><StatusPill tone={invoiceStatusTone[displayStatus]}>{titleCase(displayStatus)}</StatusPill></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Issue Date</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{formatDate(invoice.issuedOn)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Due Date</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{formatDate(invoice.dueOn)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Amount</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{formatMoney(invoice.amount)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Risk</dt>
                <dd className="mt-1"><StatusPill tone={riskTone[displayRisk]}>{titleCase(displayRisk)}</StatusPill></dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-line bg-panel p-5 shadow-card">
            <h2 className="text-lg font-semibold text-navy">Vendor Details</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-mist">Vendor Name</p>
                <p className="mt-1 font-medium text-navy">{invoice.customer}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel p-5 shadow-card">
            <h2 className="text-lg font-semibold text-navy">Payment Information</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Payment Status</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{titleCase(displayStatus)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Due Date</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{formatDate(invoice.dueOn)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Amount</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{formatMoney(invoice.amount)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Payment Terms</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{relatedPo ? 'Net 30' : 'Not available'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-line bg-panel p-5 shadow-card">
            <h2 className="text-lg font-semibold text-navy">AI Validation</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {demoAiChecks.map((check) => (
                <li key={check.label} className="flex items-center justify-between gap-3 rounded-md border border-line bg-subtle px-3 py-2">
                  <span className="font-medium text-navy">{check.label}</span>
                  {check.ok ? (
                    <span className="inline-flex items-center gap-1 text-positive">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-warning">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Warning</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-line bg-panel p-5 shadow-card">
            <h2 className="text-lg font-semibold text-navy">Purchase Order Match</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">PO Amount</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{formatMoney(relatedPo.amount)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Invoice Amount</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{formatMoney(invoice.amount)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Difference</dt>
                <dd className={`mt-1 text-sm font-medium ${hasMismatch ? 'text-warning' : 'text-positive'}`}>
                  {hasMismatch ? '+' : ''}{formatMoney(Math.abs(poDifference))}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-mist">Status</dt>
                <dd className="mt-1 text-sm font-semibold text-warning">{poStatus}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-steel">{poExplanation}</p>
          </div>

          <div className="rounded-lg border border-line bg-panel p-5 shadow-card">
            <h2 className="text-lg font-semibold text-navy">Risk Analysis</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-md bg-subtle px-3 py-2">
                <dt className="text-mist">Risk Level</dt>
                <dd className="font-semibold text-navy">{titleCase(displayRisk)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md bg-subtle px-3 py-2">
                <dt className="text-mist">Risk Reason</dt>
                <dd className="font-semibold text-navy">Purchase order mismatch</dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md bg-subtle px-3 py-2">
                <dt className="text-mist">Potential Exposure</dt>
                <dd className="figure font-semibold text-navy">{formatMoney(Math.abs(poDifference))}</dd>
              </div>
              <div className="rounded-md bg-warning-soft p-3 text-sm text-warning">
                Recommendation: Review the invoice before approving payment.
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-line bg-panel p-5 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAction('flag')}
                className="rounded-md border border-line px-4 py-2 text-sm font-medium text-navy hover:bg-subtle"
              >
                Flag Invoice
              </button>
              <button
                type="button"
                onClick={() => setAction('approve')}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Approve Invoice
              </button>
              <button
                type="button"
                onClick={() => navigate('/invoices')}
                className="rounded-md border border-line px-4 py-2 text-sm font-medium text-navy hover:bg-subtle"
              >
                Back to Invoices
              </button>
            </div>

            {successMessage && (
              <div className="mt-4 rounded-md border border-positive/20 bg-positive-soft p-3 text-sm font-medium text-positive">
                {successMessage}
                <span className="ml-2 text-positive">This is a demo action only.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/30 p-4" role="dialog" aria-modal="true" aria-labelledby="invoice-action-title">
          <div className="w-full max-w-md rounded-lg bg-panel p-5 shadow-raised">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">{action === 'approve' ? 'Approve invoice' : 'Flag invoice'}</p>
                <h2 id="invoice-action-title" className="mt-1 text-lg font-semibold text-navy">{action === 'approve' ? 'Approve Invoice?' : 'Flag Invoice?'}</h2>
              </div>
              <button type="button" aria-label="Close action dialog" onClick={handleCloseAction} className="rounded-md p-1 text-steel hover:bg-subtle">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-steel">
              {action === 'approve'
                ? `Are you sure you want to approve invoice ${invoice.number}?`
                : 'This invoice will be marked for financial review.'}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={handleCloseAction} className="rounded-md border border-line px-3 py-2 text-sm font-medium text-navy hover:bg-subtle">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`rounded-md px-3 py-2 text-sm font-medium text-white ${action === 'approve' ? 'bg-primary hover:bg-primary-dark' : 'bg-warning hover:bg-warning-dark'}`}
              >
                {action === 'approve' ? 'Confirm Approval' : 'Confirm Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
