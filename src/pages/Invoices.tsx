import { CheckCircle2, FileText, MoreHorizontal, UploadCloud, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '../components/DataTable';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { StatusPill, invoiceStatusTone, riskTone } from '../components/StatusPill';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { listInvoices } from '../services/financeApi';
import type { Invoice } from '../types';
import { describeDueDate, formatDate, formatMoney } from '../utils/format';

const summaryCards = [
  { label: 'Total Invoices', value: '128' },
  { label: 'Pending', value: '21' },
  { label: 'Paid', value: '92' },
  { label: 'Overdue', value: '9' },
  { label: 'Flagged', value: '6' },
] as const;

const demoExtraction = {
  vendor: 'ABC Suppliers',
  invoiceNumber: 'INV102',
  invoiceDate: '2026-08-14',
  dueDate: '30 Sep 2026',
  subtotal: '₹1,16,900',
  gst: '₹8,100',
  total: '₹1,25,000',
  confidence: '96%',
};

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function Invoices() {
  useDocumentTitle('Invoices');
  const navigate = useNavigate();
  const rows = useMemo(() => listInvoices(), []);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'analyzing' | 'extracting' | 'validating' | 'complete'>('idle');
  const [reviewExtraction, setReviewExtraction] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetUpload = () => {
    setIsUploadOpen(false);
    setUploadFile(null);
    setUploadError('');
    setUploadStage('idle');
    setReviewExtraction(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const beginUpload = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = ['pdf', 'png', 'jpg', 'jpeg'];
    const isAccepted = acceptedTypes.includes(extension ?? '') || ['application/pdf', 'image/png', 'image/jpeg'].includes(selectedFile.type);

    if (!isAccepted) {
      setUploadError('Unsupported file type. Please upload a PDF, JPG, or PNG invoice.');
      setUploadStage('idle');
      return;
    }

    setUploadFile(selectedFile);
    setUploadError('');
    setReviewExtraction(false);
    setUploadStage('uploading');

    await new Promise((resolve) => window.setTimeout(resolve, 400));
    setUploadStage('analyzing');
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setUploadStage('extracting');
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setUploadStage('validating');
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    setUploadStage('complete');
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      header: 'Invoice',
      render: (invoice) => (
        <span className="block">
          <span className="figure block text-navy">{invoice.number}</span>
          <span className="block text-xs text-mist">{invoice.customer}</span>
        </span>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      hideBelow: 'md',
      render: (invoice) => <span className="text-steel">{invoice.customer}</span>,
    },
    {
      key: 'issued',
      header: 'Issue Date',
      hideBelow: 'md',
      render: (invoice) => <span className="figure text-steel">{formatDate(invoice.issuedOn)}</span>,
    },
    {
      key: 'due',
      header: 'Due Date',
      render: (invoice) => (
        <span className="block">
          <span className="figure block text-steel">{formatDate(invoice.dueOn)}</span>
          <span className="block text-xs text-mist">{describeDueDate(invoice.dueOn)}</span>
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (invoice) => <span className="figure text-navy">{formatMoney(invoice.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (invoice) => (
        <StatusPill tone={invoiceStatusTone[invoice.status]}>{titleCase(invoice.status)}</StatusPill>
      ),
    },
    {
      key: 'risk',
      header: 'Risk',
      align: 'right',
      render: (invoice) => (
        <StatusPill tone={riskTone[invoice.risk]}>{titleCase(invoice.risk)}</StatusPill>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (invoice) => (
        <div className="flex justify-end">
          <button
            type="button"
            title={`Review ${invoice.number}`}
            onClick={() => navigate(`/invoices/${encodeURIComponent(invoice.number)}`)}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-subtle px-2 py-1 text-xs font-medium text-navy hover:bg-line"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="Invoices"
        lede="Manage invoices and identify payment risks."
        action={
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Invoice
          </button>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-line bg-panel p-4 shadow-card">
            <p className="text-xs uppercase tracking-[0.08em] text-steel">{card.label}</p>
            <p className="mt-3 figure text-2xl font-semibold text-navy">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Panel
          title="Invoice ledger"
          description="Professional invoice roster across payment, due-date and risk monitoring"
          flush
        >
          <DataTable
            columns={columns}
            rows={rows}
            getRowKey={(invoice) => invoice.id}
            minWidth="72rem"
            emptyMessage="No invoices available for this period."
          />
        </Panel>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/30 p-4" role="dialog" aria-modal="true" aria-labelledby="invoice-detail-title">
          <div className="w-full max-w-lg rounded-lg bg-panel p-5 shadow-raised">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Invoice review</p>
                <h2 id="invoice-detail-title" className="mt-1 text-lg font-semibold text-navy">{selectedInvoice.number}</h2>
              </div>
              <button type="button" aria-label="Close invoice detail" onClick={() => setSelectedInvoice(null)} className="rounded-md p-1 text-steel hover:bg-subtle">
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
              <div>
                <dt className="text-xs text-mist">Vendor</dt>
                <dd className="mt-1 text-navy">{selectedInvoice.customer}</dd>
              </div>
              <div>
                <dt className="text-xs text-mist">Amount</dt>
                <dd className="figure mt-1 text-navy">{formatMoney(selectedInvoice.amount)}</dd>
              </div>
              <div>
                <dt className="text-xs text-mist">Issue date</dt>
                <dd className="mt-1 text-navy">{formatDate(selectedInvoice.issuedOn)}</dd>
              </div>
              <div>
                <dt className="text-xs text-mist">Due date</dt>
                <dd className="mt-1 text-navy">{formatDate(selectedInvoice.dueOn)}</dd>
              </div>
              <div>
                <dt className="text-xs text-mist">Status</dt>
                <dd className="mt-1"><StatusPill tone={invoiceStatusTone[selectedInvoice.status]}>{titleCase(selectedInvoice.status)}</StatusPill></dd>
              </div>
              <div>
                <dt className="text-xs text-mist">Risk</dt>
                <dd className="mt-1"><StatusPill tone={riskTone[selectedInvoice.risk]}>{titleCase(selectedInvoice.risk)}</StatusPill></dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/30 p-4" role="dialog" aria-modal="true" aria-labelledby="upload-invoice-title">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-panel p-5 shadow-raised">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Invoice upload</p>
                <h2 id="upload-invoice-title" className="mt-1 text-lg font-semibold text-navy">Upload Invoice</h2>
              </div>
              <button type="button" aria-label="Close invoice upload" onClick={resetUpload} className="rounded-md p-1 text-steel hover:bg-subtle">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!uploadFile && (
              <div className="mt-5 rounded-lg border border-dashed border-line-strong bg-subtle p-6 text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 text-base font-semibold text-navy">Drop PDF or image here</p>
                <p className="mt-1 text-sm text-steel">Choose a PDF, PNG, JPG, or JPEG invoice.</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Select file
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf" className="hidden" onChange={(event) => void beginUpload(event.target.files?.[0])} />
                <p className="mt-4 text-xs text-mist">AI will extract: Vendor, Invoice number, Invoice date, Due date, Subtotal, Tax, Total amount.</p>
              </div>
            )}

            {uploadFile && (
              <div className="mt-5 space-y-4">
                <div className="rounded-md border border-line bg-subtle p-4">
                  <p className="text-sm font-semibold text-navy">{uploadFile.name}</p>
                  <p className="mt-1 text-xs text-steel">Frontend demo invoice extraction</p>
                </div>

                {uploadError && <p className="rounded-md bg-critical-soft p-3 text-sm text-critical">{uploadError}</p>}

                {!uploadError && uploadStage !== 'complete' && (
                  <div className="rounded-md border border-line bg-panel p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-navy">
                      <FileText className="h-4 w-4 text-primary" />
                      {uploadStage === 'uploading' && 'Uploading...'}
                      {uploadStage === 'analyzing' && 'Analyzing document...'}
                      {uploadStage === 'extracting' && 'Extracting fields...'}
                      {uploadStage === 'validating' && 'Validating...'}
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-subtle">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: uploadStage === 'uploading' ? '20%' : uploadStage === 'analyzing' ? '40%' : uploadStage === 'extracting' ? '65%' : uploadStage === 'validating' ? '85%' : '100%' }}
                      />
                    </div>
                  </div>
                )}

                {uploadStage === 'complete' && (
                  <div className="space-y-4 rounded-md border border-positive/25 bg-positive-soft p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-positive">
                      <CheckCircle2 className="h-4 w-4" />
                      Complete
                    </div>

                    {!reviewExtraction ? (
                      <>
                        <p className="text-sm text-positive">Demo extraction result</p>
                        <div className="grid gap-3 rounded-md bg-panel p-3 text-sm text-navy sm:grid-cols-2">
                          <div><span className="text-xs text-mist">Vendor</span><p className="mt-1 font-medium">{demoExtraction.vendor}</p></div>
                          <div><span className="text-xs text-mist">Invoice</span><p className="mt-1 font-medium">{demoExtraction.invoiceNumber}</p></div>
                          <div><span className="text-xs text-mist">Subtotal</span><p className="mt-1 font-medium">{demoExtraction.subtotal}</p></div>
                          <div><span className="text-xs text-mist">GST</span><p className="mt-1 font-medium">{demoExtraction.gst}</p></div>
                          <div><span className="text-xs text-mist">Total</span><p className="mt-1 font-medium">{demoExtraction.total}</p></div>
                          <div><span className="text-xs text-mist">Due</span><p className="mt-1 font-medium">{demoExtraction.dueDate}</p></div>
                          <div className="sm:col-span-2"><span className="text-xs text-mist">Confidence</span><p className="mt-1 font-medium">{demoExtraction.confidence}</p></div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setReviewExtraction(true)} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark">Review Extraction</button>
                          <button type="button" onClick={resetUpload} className="rounded-md border border-line px-3 py-2 text-sm font-medium text-navy hover:bg-subtle">Close</button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3 rounded-md bg-panel p-4 text-sm">
                        <p className="text-base font-semibold text-navy">Review Extraction</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div><span className="text-xs text-mist">Vendor</span><p className="mt-1 text-navy">{demoExtraction.vendor}</p></div>
                          <div><span className="text-xs text-mist">Invoice number</span><p className="mt-1 text-navy">{demoExtraction.invoiceNumber}</p></div>
                          <div><span className="text-xs text-mist">Invoice date</span><p className="mt-1 text-navy">{demoExtraction.invoiceDate}</p></div>
                          <div><span className="text-xs text-mist">Due date</span><p className="mt-1 text-navy">{demoExtraction.dueDate}</p></div>
                          <div><span className="text-xs text-mist">Subtotal</span><p className="mt-1 text-navy">{demoExtraction.subtotal}</p></div>
                          <div><span className="text-xs text-mist">GST</span><p className="mt-1 text-navy">{demoExtraction.gst}</p></div>
                          <div className="sm:col-span-2"><span className="text-xs text-mist">Total</span><p className="mt-1 text-navy">{demoExtraction.total}</p></div>
                        </div>
                        <div className="flex justify-end">
                          <button type="button" onClick={resetUpload} className="rounded-md border border-line px-3 py-2 text-sm font-medium text-navy hover:bg-subtle">Close</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
