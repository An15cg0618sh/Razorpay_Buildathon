import { Download, FileUp, Filter, MoreHorizontal, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable, type Column } from '../components/DataTable';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { StatusPill, transactionStatusTone } from '../components/StatusPill';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { detectFile, extractTransactions, type DetectedFile, type ImportExtraction } from '../services/transactionImporter';
import { listTransactions } from '../services/financeApi';
import type { Transaction } from '../types';
import { formatDate, formatSignedMoney } from '../utils/format';

type RiskLabel = 'Normal' | 'Matched' | 'Review' | 'High Risk' | 'Critical';
type ImportStage = 'idle' | 'uploading' | 'processing' | 'validating' | 'reading' | 'extracting' | 'normalizing' | 'checking' | 'ready' | 'complete' | 'error';

const pageSize = 8;

function referenceFor(txn: Transaction) {
  return `BANK-${txn.id.replace('txn-', '')}`;
}

function riskFor(txn: Transaction): RiskLabel {
  if (txn.description.toLowerCase().includes('duplicate')) return 'Critical';
  if (txn.description.toLowerCase().includes('unusual')) return 'High Risk';
  if (txn.status === 'unmatched') return 'Review';
  if (txn.status === 'cleared') return 'Matched';
  return 'Normal';
}

const riskTone = {
  Normal: 'positive',
  Matched: 'positive',
  Review: 'warning',
  'High Risk': 'negative',
  Critical: 'negative',
} as const;

function createColumns(onView: (txn: Transaction) => void): Column<Transaction>[] {
  return [
  {
    key: 'date',
    header: 'Date',
    render: (txn) => <span className="figure text-steel">{formatDate(txn.date)}</span>,
  },
  {
    key: 'description',
    header: 'Description',
    render: (txn) => (
      <span className="block">
        <span className="block text-navy">{txn.description}</span>
        <span className="block text-xs text-mist">{referenceFor(txn)}</span>
      </span>
    ),
  },
  {
    key: 'reference',
    header: 'Reference',
    hideBelow: 'lg',
    render: (txn) => <span className="figure text-steel">{referenceFor(txn)}</span>,
  },
  {
    key: 'category',
    header: 'Category',
    hideBelow: 'md',
    render: (txn) => <span className="text-steel">{txn.category}</span>,
  },
  {
    key: 'vendor',
    header: 'Vendor',
    hideBelow: 'lg',
    render: (txn) => <span className="text-steel">{txn.counterparty}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (txn) => (
      <span className={`figure ${txn.direction === 'inflow' ? 'text-positive' : 'text-navy'}`}>
        {formatSignedMoney(txn.amount, txn.direction)}
      </span>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    hideBelow: 'md',
    render: (txn) => (
      <StatusPill tone={txn.direction === 'inflow' ? 'positive' : 'neutral'}>
        {txn.direction === 'inflow' ? 'Credit' : 'Debit'}
      </StatusPill>
    ),
  },
  {
    key: 'risk',
    header: 'Risk',
    hideBelow: 'lg',
    render: (txn) => <StatusPill tone={riskTone[riskFor(txn)]}>{riskFor(txn)}</StatusPill>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (txn) => (
      <StatusPill tone={transactionStatusTone[txn.status]}>{txn.status}</StatusPill>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (txn) => (
      <button
        type="button"
        title={`View ${referenceFor(txn)}`}
        aria-label={`View ${referenceFor(txn)}`}
        onClick={() => onView(txn)}
        className="rounded-md p-1.5 text-steel transition-colors hover:bg-subtle hover:text-primary"
      >
        <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
      </button>
    ),
  },
  ];
}

export function Transactions() {
  useDocumentTitle('Transactions');
  const baseTransactions = useMemo(() => listTransactions(), []);
  const [imported, setImported] = useState<Transaction[]>([]);
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [vendor, setVendor] = useState('all');
  const [risk, setRisk] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [detected, setDetected] = useState<DetectedFile | null>(null);
  const [extraction, setExtraction] = useState<ImportExtraction | null>(null);
  const [stage, setStage] = useState<ImportStage>('idle');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const columns = useMemo(() => createColumns(setSelected), []);
  const allTransactions = useMemo(() => [...imported, ...baseTransactions], [baseTransactions, imported]);

  const categories = useMemo(() => [...new Set(allTransactions.map((txn) => txn.category))].sort(), [allTransactions]);
  const vendors = useMemo(() => [...new Set(allTransactions.map((txn) => txn.counterparty))].sort(), [allTransactions]);
  const risks = ['Normal', 'Matched', 'Review', 'High Risk', 'Critical'] as const;

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null);
        resetImport();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allTransactions.filter((txn) => {
      const searchable = `${txn.description} ${referenceFor(txn)} ${txn.counterparty} ${txn.category} ${txn.account} ${txn.amount} ${formatSignedMoney(txn.amount, txn.direction)}`.toLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (!dateFrom || txn.date >= dateFrom) &&
        (!dateTo || txn.date <= dateTo) &&
        (type === 'all' || txn.direction === type) &&
        (category === 'all' || txn.category === category) &&
        (vendor === 'all' || txn.counterparty === vendor) &&
        (risk === 'all' || riskFor(txn) === risk)
      );
    });
  }, [allTransactions, category, dateFrom, dateTo, query, risk, type, vendor]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [category, dateFrom, dateTo, query, risk, type, vendor]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const clearFilters = () => {
    setQuery(''); setDateFrom(''); setDateTo(''); setType('all'); setCategory('all'); setVendor('all'); setRisk('all');
  };

  const chooseFile = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    setFile(selectedFile); setExtraction(null); setError('');
    const detectedFile = detectFile(selectedFile);
    if (!detectedFile) { setDetected(null); setStage('error'); setError('Unsupported file type. Please choose one of the supported financial formats.'); return; }
    setDetected(detectedFile); setStage('uploading');
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350)); setStage('processing');
      await new Promise((resolve) => window.setTimeout(resolve, 350)); setStage('validating');
      await new Promise((resolve) => window.setTimeout(resolve, 450)); setStage('reading');
      await new Promise((resolve) => window.setTimeout(resolve, 450)); setStage('extracting');
      const result = await extractTransactions(selectedFile, detectedFile); setExtraction(result);
      setStage('normalizing'); await new Promise((resolve) => window.setTimeout(resolve, 400));
      setStage('checking'); await new Promise((resolve) => window.setTimeout(resolve, 400)); setStage('ready');
    } catch (caught) { setStage('error'); setError(caught instanceof Error ? caught.message : 'Unable to process this file. Please check the document and try again.'); }
  };
  const resetImport = () => { setIsImportOpen(false); setFile(null); setDetected(null); setExtraction(null); setStage('idle'); setError(''); if (fileInput.current) fileInput.current.value = ''; };
  const importTransactions = () => { if (!extraction?.transactions.length) return; setImported((current) => [...extraction.transactions, ...current]); setStage('complete'); };
  const supportedFormats = 'CSV, XLS, XLSX, PDF, DOC, DOCX, TXT, JSON, XML, PNG, JPG, JPEG, WEBP';
  const stageLabel = { uploading: 'Uploading...', processing: 'Processing...', validating: 'Validating file...', reading: 'Reading document...', extracting: 'Extracting transactions...', normalizing: 'Normalizing financial data...', checking: 'Validating transactions...' } as const;

  const exportCsv = () => {
    const header = ['Date', 'Description', 'Reference', 'Category', 'Vendor', 'Amount', 'Type', 'Risk', 'Status'];
    const rows = filtered.map((txn) => [
      txn.date, txn.description, referenceFor(txn), txn.category, txn.counterparty,
      txn.direction === 'inflow' ? txn.amount : -txn.amount, txn.direction === 'inflow' ? 'Credit' : 'Debit', riskFor(txn), txn.status,
    ]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'finpilot-transactions.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeading
        title="Transactions"
        lede="Monitor and analyze company financial activity."
      />

      <Panel title="Transaction ledger" description={`${filtered.length} of ${allTransactions.length} transactions`} flush action={
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-medium text-steel hover:bg-subtle"><Download className="h-3.5 w-3.5" />Export</button>
          <button type="button" onClick={() => setIsImportOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 font-medium text-white hover:bg-primary-dark"><FileUp className="h-3.5 w-3.5" />Import Bank Statement</button>
          <input ref={fileInput} type="file" accept=".csv,.xls,.xlsx,.pdf,.doc,.docx,.txt,.json,.xml,.png,.jpg,.jpeg,.webp,text/csv,application/json,application/xml,text/xml,image/png,image/jpeg,image/webp,application/pdf" className="hidden" onChange={(event) => void chooseFile(event.target.files?.[0])} />
        </div>
      }>
        <div className="border-b border-line bg-subtle px-4 py-4 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative sm:col-span-2 lg:col-span-2"><span className="sr-only">Search transactions</span><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-mist" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search description, reference, vendor..." className="w-full rounded-md border border-line bg-panel py-2 pl-9 pr-3 text-sm text-navy placeholder:text-mist" /></label>
            <label><span className="sr-only">From date</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-steel" /></label>
            <label><span className="sr-only">To date</span><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-steel" /></label>
            <label><span className="sr-only">Transaction type</span><select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-steel"><option value="all">All types</option><option value="inflow">Credit</option><option value="outflow">Debit</option></select></label>
            <label><span className="sr-only">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-steel"><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="sr-only">Vendor</span><select value={vendor} onChange={(event) => setVendor(event.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-steel"><option value="all">All vendors</option>{vendors.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="sr-only">Risk</span><select value={risk} onChange={(event) => setRisk(event.target.value)} className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-steel"><option value="all">All risk levels</option>{risks.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs"><span className="inline-flex items-center gap-1.5 text-steel"><Filter className="h-3.5 w-3.5" />Filters apply to all {allTransactions.length} records</span><button type="button" onClick={clearFilters} className="font-medium text-primary hover:text-primary-dark">Clear filters</button></div>
        </div>
        <DataTable columns={columns} rows={visible} getRowKey={(txn) => txn.id} minWidth="70rem" emptyMessage="No transactions match these filters." />
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs text-steel sm:px-5"><span>Page {page} of {totalPages}</span><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-line px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:bg-subtle">Previous</button><button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-line px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:bg-subtle">Next</button></div></div>
      </Panel>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transaction-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="w-full max-w-lg rounded-lg bg-panel p-5 shadow-raised">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Transaction detail</p>
                <h2 id="transaction-detail-title" className="mt-1 text-lg font-semibold text-navy">{selected.description}</h2>
              </div>
              <button type="button" aria-label="Close transaction details" onClick={() => setSelected(null)} className="rounded-md p-1 text-steel hover:bg-subtle">
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
              <div><dt className="text-xs text-mist">Reference</dt><dd className="figure mt-1 text-navy">{referenceFor(selected)}</dd></div>
              <div><dt className="text-xs text-mist">Amount</dt><dd className="figure mt-1 text-navy">{formatSignedMoney(selected.amount, selected.direction)}</dd></div>
              <div><dt className="text-xs text-mist">Vendor</dt><dd className="mt-1 text-navy">{selected.counterparty}</dd></div>
              <div><dt className="text-xs text-mist">Account</dt><dd className="mt-1 text-navy">{selected.account}</dd></div>
              <div><dt className="text-xs text-mist">Category</dt><dd className="mt-1 text-navy">{selected.category}</dd></div>
              <div><dt className="text-xs text-mist">Date</dt><dd className="mt-1 text-navy">{formatDate(selected.date)}</dd></div>
            </dl>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetImport();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-panel p-5 shadow-raised">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Local file import</p>
                <h2 id="import-title" className="mt-1 text-lg font-semibold text-navy">Import Bank Statement</h2>
              </div>
              <button type="button" aria-label="Close import dialog" onClick={resetImport} className="rounded-md p-1 text-steel hover:bg-subtle">
                <X className="h-4 w-4" />
              </button>
            </div>
            {!file && (
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void chooseFile(event.dataTransfer.files?.[0]);
                }}
                className="mt-5 rounded-lg border border-dashed border-line-strong bg-subtle p-6 text-center"
              >
                <FileUp className="mx-auto h-7 w-7 text-primary" />
                <p className="mt-2 font-medium text-navy">Upload financial files</p>
                <p className="mt-1 text-xs text-steel">Click to select or drag and drop</p>
                <button type="button" onClick={() => fileInput.current?.click()} className="mt-4 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark">Choose file</button>
                <p className="mt-4 text-xs text-mist">Supported: {supportedFormats}</p>
              </div>
            )}
            {file && detected && (
              <div className="mt-5 space-y-4">
                <div className="rounded-md border border-line bg-subtle p-4">
                  <p className="text-sm font-semibold text-navy">{file.name}</p>
                  <p className="mt-1 text-xs text-steel">Type: {detected.format}</p>
                </div>
                {stage !== 'ready' && stage !== 'error' && stage !== 'complete' && <p className="rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">{stageLabel[stage as keyof typeof stageLabel] ?? 'Preparing import...'}</p>}
                {stage === 'error' && <p className="rounded-md bg-critical-soft p-3 text-sm text-critical">{error}</p>}
                {stage === 'complete' && (
                  <div className="rounded-md bg-positive-soft p-4 text-sm">
                    <p className="font-semibold text-positive">Import complete</p>
                    <p className="mt-1 text-positive">{extraction?.transactions.length ?? 0} transactions imported successfully</p>
                    <button type="button" onClick={resetImport} className="mt-4 rounded-md bg-primary px-3 py-2 font-medium text-white hover:bg-primary-dark">Done</button>
                  </div>
                )}
                {stage === 'ready' && extraction && (
                  <div className="space-y-4">
                    <p className="rounded-md bg-positive-soft p-3 text-sm font-medium text-positive">{extraction.transactions.length ? `${extraction.transactions.length} transactions ready to import` : extraction.message}</p>
                    {extraction.transactions.length > 0 && (
                      <>
                        <h3 className="text-sm font-semibold text-navy">Import Preview</h3>
                        <div className="overflow-x-auto rounded-md border border-line">
                          <table className="w-full min-w-[34rem] text-left text-xs">
                            <thead className="bg-subtle text-steel">
                              <tr>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">Description</th>
                                <th className="px-3 py-2">Amount</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Vendor</th>
                                <th className="px-3 py-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {extraction.transactions.slice(0, 5).map((txn) => (
                                <tr key={txn.id} className="border-t border-line">
                                  <td className="px-3 py-2">{formatDate(txn.date)}</td>
                                  <td className="px-3 py-2">{txn.description}</td>
                                  <td className="px-3 py-2">{formatSignedMoney(txn.amount, txn.direction)}</td>
                                  <td className="px-3 py-2">{txn.direction === 'inflow' ? 'Credit' : 'Debit'}</td>
                                  <td className="px-3 py-2">{txn.counterparty}</td>
                                  <td className="px-3 py-2">{txn.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={resetImport} className="rounded-md border border-line px-3 py-2 text-sm font-medium text-steel hover:bg-subtle">Cancel</button>
                          <button type="button" onClick={importTransactions} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark">Import Transactions</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {detected.capability !== 'parsed' && stage === 'ready' && <p className="text-xs text-steel">This format is upload-supported; browser {detected.capability === 'ocr-pending' ? 'OCR' : 'document parser'} integration is still pending.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
