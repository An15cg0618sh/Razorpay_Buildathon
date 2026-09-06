import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  ChevronRight,
  Filter,
  Info,
  RotateCcw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  ALL_RISK_TYPES,
  ALL_SEVERITIES,
  listCentralizedRisks,
} from '../services/financeApi';
import type { CentralizedRisk, RiskSeverity, RiskStatus, RiskType } from '../types';
import { cn } from '../utils/cn';
import { formatDate, formatMoney } from '../utils/format';

/**
 * Returns professional, restrained visual classes per severity.
 * RED is strictly used ONLY for Critical risks.
 */
function severityBadgeStyles(severity: RiskSeverity) {
  switch (severity) {
    case 'Critical':
      return 'border-critical/30 bg-critical-soft text-critical';
    case 'High':
      return 'border-warning/30 bg-warning-soft text-warning';
    case 'Medium':
      return 'border-line-strong bg-subtle text-navy';
    case 'Low':
      return 'border-line bg-panel text-steel';
  }
}

function severityAccentBorder(severity: RiskSeverity) {
  switch (severity) {
    case 'Critical':
      return 'border-l-4 border-l-critical';
    case 'High':
      return 'border-l-4 border-l-warning';
    case 'Medium':
      return 'border-l-4 border-l-steel';
    case 'Low':
      return 'border-l-4 border-l-line-strong';
  }
}

function severityScoreBarColor(severity: RiskSeverity) {
  switch (severity) {
    case 'Critical':
      return 'bg-critical';
    case 'High':
      return 'bg-warning';
    case 'Medium':
      return 'bg-steel';
    case 'Low':
      return 'bg-line-strong';
  }
}

function statusBadgeStyles(status: RiskStatus) {
  switch (status) {
    case 'Open':
      return 'border-line-strong bg-subtle text-navy';
    case 'Under Review':
      return 'border-warning/30 bg-warning-soft text-warning';
    case 'Resolved':
      return 'border-positive/30 bg-positive-soft text-positive';
    case 'Dismissed':
      return 'border-line bg-panel text-mist';
  }
}

export function RiskCenter() {
  useDocumentTitle('Risk Center');

  // Centralized risk dataset in state to support in-memory action updates
  const [risks, setRisks] = useState<CentralizedRisk[]>(() => listCentralizedRisks());

  // Filter states
  const [selectedSeverity, setSelectedSeverity] = useState<RiskSeverity | 'All'>('All');
  const [selectedType, setSelectedType] = useState<RiskType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<RiskStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail drawer state
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Selected risk object derived from state
  const selectedRisk = useMemo(
    () => risks.find((r) => r.id === selectedRiskId) ?? null,
    [risks, selectedRiskId],
  );

  // Static summary counts derived strictly from the centralized dataset
  const summaryCounts = useMemo(() => {
    return {
      critical: risks.filter((r) => r.severity === 'Critical').length,
      high: risks.filter((r) => r.severity === 'High').length,
      medium: risks.filter((r) => r.severity === 'Medium').length,
      low: risks.filter((r) => r.severity === 'Low').length,
      total: risks.length,
    };
  }, [risks]);

  // Combined filters applied to centralized risks
  const filteredRisks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return risks.filter((risk) => {
      // Severity filter
      if (selectedSeverity !== 'All' && risk.severity !== selectedSeverity) {
        return false;
      }
      // Risk Type filter
      if (selectedType !== 'All' && risk.riskType !== selectedType) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'All' && risk.status !== selectedStatus) {
        return false;
      }
      // Text search
      if (query) {
        const target = `${risk.vendor} ${risk.explanation} ${risk.riskType} ${risk.whyDetected} ${risk.id} ${risk.relatedTransaction?.reference ?? ''} ${risk.relatedInvoice?.number ?? ''}`.toLowerCase();
        if (!target.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [risks, selectedSeverity, selectedType, selectedStatus, searchQuery]);

  // Action handlers updating state consistently
  const updateRiskStatus = (riskId: string, newStatus: RiskStatus) => {
    setRisks((prevRisks) =>
      prevRisks.map((item) =>
        item.id === riskId ? { ...item, status: newStatus } : item,
      ),
    );
    setActionFeedback(`Status updated to ${newStatus}`);
  };

  // Clear feedback message after 3 seconds
  useEffect(() => {
    if (!actionFeedback) return;
    const timer = window.setTimeout(() => setActionFeedback(null), 3000);
    return () => window.clearTimeout(timer);
  }, [actionFeedback]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedRiskId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasActiveFilters =
    selectedSeverity !== 'All' ||
    selectedType !== 'All' ||
    selectedStatus !== 'All' ||
    searchQuery.trim().length > 0;

  const clearAllFilters = () => {
    setSelectedSeverity('All');
    setSelectedType('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeading
        title="Risk Center"
        lede="Identify financial anomalies before they become costly."
        action={
          <div className="flex items-center gap-2">
            <span className="figure rounded-md border border-line bg-subtle px-2.5 py-1 text-xs font-semibold text-steel">
              {risks.length} Anomalies Monitored
            </span>
          </div>
        }
      />

      {/* Summary Cards */}
      <section aria-label="Risk severity summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Critical Card */}
        <button
          type="button"
          onClick={() => setSelectedSeverity((curr) => (curr === 'Critical' ? 'All' : 'Critical'))}
          className={cn(
            'group flex flex-col justify-between rounded-lg border p-4 text-left transition-all duration-150',
            selectedSeverity === 'Critical'
              ? 'border-critical bg-critical-soft ring-2 ring-critical'
              : 'border-line bg-panel hover:border-line-strong hover:shadow-card',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-critical uppercase">
              <AlertOctagon className="h-4 w-4" aria-hidden="true" />
              Critical
            </span>
            <span className="text-[0.6875rem] font-medium text-mist">
              Score ≥ 90
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="figure text-3xl font-bold tracking-tight text-critical">
              {summaryCounts.critical}
            </span>
            <span className="text-xs text-steel">
              {selectedSeverity === 'Critical' ? 'Filtering' : 'Click to filter'}
            </span>
          </div>
          <p className="mt-2 text-xs text-steel">
            Immediate financial exposure requiring urgent controller action
          </p>
        </button>

        {/* High Card */}
        <button
          type="button"
          onClick={() => setSelectedSeverity((curr) => (curr === 'High' ? 'All' : 'High'))}
          className={cn(
            'group flex flex-col justify-between rounded-lg border p-4 text-left transition-all duration-150',
            selectedSeverity === 'High'
              ? 'border-warning bg-warning-soft ring-2 ring-warning'
              : 'border-line bg-panel hover:border-line-strong hover:shadow-card',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-warning uppercase">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              High
            </span>
            <span className="text-[0.6875rem] font-medium text-mist">
              Score 70–89
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="figure text-3xl font-bold tracking-tight text-navy">
              {summaryCounts.high}
            </span>
            <span className="text-xs text-steel">
              {selectedSeverity === 'High' ? 'Filtering' : 'Click to filter'}
            </span>
          </div>
          <p className="mt-2 text-xs text-steel">
            Significant compliance, terms or payment variance anomalies
          </p>
        </button>

        {/* Medium Card */}
        <button
          type="button"
          onClick={() => setSelectedSeverity((curr) => (curr === 'Medium' ? 'All' : 'Medium'))}
          className={cn(
            'group flex flex-col justify-between rounded-lg border p-4 text-left transition-all duration-150',
            selectedSeverity === 'Medium'
              ? 'border-line-strong bg-subtle ring-2 ring-steel'
              : 'border-line bg-panel hover:border-line-strong hover:shadow-card',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-steel uppercase">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              Medium
            </span>
            <span className="text-[0.6875rem] font-medium text-mist">
              Score 40–69
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="figure text-3xl font-bold tracking-tight text-navy">
              {summaryCounts.medium}
            </span>
            <span className="text-xs text-steel">
              {selectedSeverity === 'Medium' ? 'Filtering' : 'Click to filter'}
            </span>
          </div>
          <p className="mt-2 text-xs text-steel">
            Unusual frequency, documentation gaps and liquidity watch items
          </p>
        </button>

        {/* Low Card */}
        <button
          type="button"
          onClick={() => setSelectedSeverity((curr) => (curr === 'Low' ? 'All' : 'Low'))}
          className={cn(
            'group flex flex-col justify-between rounded-lg border p-4 text-left transition-all duration-150',
            selectedSeverity === 'Low'
              ? 'border-line-strong bg-subtle ring-2 ring-mist'
              : 'border-line bg-panel hover:border-line-strong hover:shadow-card',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-steel uppercase">
              <Info className="h-4 w-4 text-mist" aria-hidden="true" />
              Low
            </span>
            <span className="text-[0.6875rem] font-medium text-mist">
              Score 10–39
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="figure text-3xl font-bold tracking-tight text-navy">
              {summaryCounts.low}
            </span>
            <span className="text-xs text-steel">
              {selectedSeverity === 'Low' ? 'Filtering' : 'Click to filter'}
            </span>
          </div>
          <p className="mt-2 text-xs text-steel">
            Informational flags, minor rounding variances and petty items
          </p>
        </button>
      </section>

      {/* Filters & Search Controls */}
      <Panel
        title="Detected Financial Risks"
        description={`${filteredRisks.length} of ${risks.length} risks displayed`}
        flush
      >
        <div className="border-b border-line bg-subtle p-4 sm:px-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
            {/* Search Input */}
            <div className="relative sm:col-span-2 lg:col-span-4">
              <label htmlFor="risk-search" className="sr-only">
                Search risks by vendor, description, or reference
              </label>
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-mist" />
              <input
                id="risk-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search vendor, type, explanation..."
                className="w-full rounded-md border border-line bg-panel py-2 pr-3 pl-9 text-sm text-navy placeholder:text-mist focus:border-primary focus:outline-none"
              />
            </div>

            {/* Severity Filter */}
            <div className="lg:col-span-3">
              <label htmlFor="severity-filter" className="sr-only">
                Filter by Severity
              </label>
              <select
                id="severity-filter"
                value={selectedSeverity}
                onChange={(event) =>
                  setSelectedSeverity(event.target.value as RiskSeverity | 'All')
                }
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-navy focus:border-primary focus:outline-none"
              >
                <option value="All">All Severities</option>
                {ALL_SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Type Filter */}
            <div className="lg:col-span-3">
              <label htmlFor="type-filter" className="sr-only">
                Filter by Risk Type
              </label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(event.target.value as RiskType | 'All')
                }
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-navy focus:border-primary focus:outline-none"
              >
                <option value="All">All Risk Types</option>
                {ALL_RISK_TYPES.map((riskType) => (
                  <option key={riskType} value={riskType}>
                    {riskType}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <label htmlFor="status-filter" className="sr-only">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value as RiskStatus | 'All')
                }
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-navy focus:border-primary focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicators & Reset */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-steel">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                Active filters:
              </span>
              <span className="rounded bg-panel px-2 py-0.5 font-medium border border-line text-navy">
                Severity: {selectedSeverity}
              </span>
              <span className="rounded bg-panel px-2 py-0.5 font-medium border border-line text-navy">
                Type: {selectedType}
              </span>
              {selectedStatus !== 'All' && (
                <span className="rounded bg-panel px-2 py-0.5 font-medium border border-line text-navy">
                  Status: {selectedStatus}
                </span>
              )}
              {searchQuery && (
                <span className="rounded bg-panel px-2 py-0.5 font-medium border border-line text-navy">
                  Query: "{searchQuery}"
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-dark"
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Risk List */}
        {filteredRisks.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-mist" />
            <h3 className="mt-2 text-sm font-semibold text-navy">No risks match current criteria</h3>
            <p className="mt-1 text-xs text-steel">
              Try adjusting the severity or risk-type filters to see more results.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:bg-subtle"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {filteredRisks.map((risk) => {
              const isSelected = selectedRiskId === risk.id;

              return (
                <article
                  key={risk.id}
                  onClick={() => setSelectedRiskId(risk.id)}
                  className={cn(
                    'group relative cursor-pointer p-4 transition-colors duration-150 sm:p-5 hover:bg-subtle',
                    severityAccentBorder(risk.severity),
                    isSelected && 'bg-subtle ring-1 ring-primary/20',
                  )}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left & Middle details */}
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Meta badges: Severity, Risk Type, Status, Score */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Severity */}
                        <span
                          className={cn(
                            'inline-flex items-center rounded border px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider uppercase',
                            severityBadgeStyles(risk.severity),
                          )}
                        >
                          {risk.severity}
                        </span>

                        {/* Risk Type */}
                        <span className="inline-flex items-center rounded-md border border-line bg-panel px-2 py-0.5 text-xs font-medium text-steel">
                          {risk.riskType}
                        </span>

                        {/* Status */}
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                            statusBadgeStyles(risk.status),
                          )}
                        >
                          {risk.status}
                        </span>

                        {/* Risk Score */}
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-2 py-0.5 text-xs font-semibold text-navy">
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              severityScoreBarColor(risk.severity),
                            )}
                          />
                          Risk Score: <strong className="figure">{risk.riskScore}</strong>/100
                        </span>

                        <span className="text-[0.6875rem] text-mist">
                          Detected {formatDate(risk.detectedDate)}
                        </span>
                      </div>

                      {/* Vendor Name and Amount */}
                      <div className="flex flex-wrap items-baseline justify-between gap-2 pt-1">
                        <h3 className="text-base font-semibold text-navy group-hover:text-primary transition-colors">
                          {risk.vendor}
                        </h3>
                        <span className="figure text-lg font-bold text-navy">
                          {formatMoney(risk.amount)}
                        </span>
                      </div>

                      {/* Explanation */}
                      <p className="text-sm text-steel italic">
                        "{risk.explanation}"
                      </p>

                      {/* Cross references hint */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist pt-1">
                        {risk.relatedTransaction && (
                          <span>
                            Txn: <span className="figure font-medium text-steel">{risk.relatedTransaction.reference}</span>
                          </span>
                        )}
                        {risk.relatedInvoice && (
                          <span>
                            Inv: <span className="figure font-medium text-steel">{risk.relatedInvoice.number}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-2 flex shrink-0 items-center justify-end gap-2 lg:mt-0 lg:ml-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRiskId(risk.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-navy shadow-xs transition-colors hover:border-line-strong hover:bg-subtle hover:text-primary"
                      >
                        Inspect Anomaly
                        <ChevronRight className="h-3.5 w-3.5 text-mist group-hover:text-primary" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Risk Detail Drawer / Panel */}
      {selectedRisk && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-navy/40 transition-opacity"
            onClick={() => setSelectedRiskId(null)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="risk-detail-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-line bg-panel shadow-drawer"
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-line p-5">
              <div className="min-w-0 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded border px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider uppercase',
                      severityBadgeStyles(selectedRisk.severity),
                    )}
                  >
                    {selectedRisk.severity}
                  </span>
                  <span className="text-xs font-medium text-steel">
                    {selectedRisk.riskType}
                  </span>
                </div>
                <h2 id="risk-detail-title" className="mt-1.5 text-xl font-bold text-navy truncate">
                  {selectedRisk.vendor}
                </h2>
                <p className="figure mt-0.5 text-lg font-semibold text-navy">
                  {formatMoney(selectedRisk.amount)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRiskId(null)}
                aria-label="Close risk detail drawer"
                className="rounded-md p-1.5 text-mist transition-colors hover:bg-subtle hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notification Banner when action is taken */}
            {actionFeedback && (
              <div className="flex items-center gap-2 border-b border-positive/30 bg-positive-soft px-5 py-2.5 text-xs font-medium text-positive">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
            )}

            {/* Drawer Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Risk Score Deterministic Meter */}
              <div className="rounded-lg border border-line bg-subtle p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold tracking-wider text-steel uppercase">
                    Deterministic Risk Score
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="figure text-2xl font-bold text-navy">
                      {selectedRisk.riskScore}
                    </span>
                    <span className="text-xs text-mist">/ 100</span>
                  </div>
                </div>

                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-panel border border-line">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', severityScoreBarColor(selectedRisk.severity))}
                    style={{ width: `${selectedRisk.riskScore}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-mist">
                  Calculated deterministically by policy rules for {selectedRisk.riskType.toLowerCase()} detection (severity: {selectedRisk.severity}).
                </p>
              </div>

              {/* Status and Action Buttons */}
              <div className="rounded-lg border border-line p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-steel">
                    Current Status
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
                      statusBadgeStyles(selectedRisk.status),
                    )}
                  >
                    {selectedRisk.status}
                  </span>
                </div>

                <p className="text-xs text-mist">
                  Take controller action on this anomaly to update ledger workflow:
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => updateRiskStatus(selectedRisk.id, 'Under Review')}
                    className={cn(
                      'inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition-colors',
                      selectedRisk.status === 'Under Review'
                        ? 'border-warning bg-warning-soft text-warning font-bold'
                        : 'border-line bg-panel text-navy hover:bg-subtle',
                    )}
                  >
                    Review
                  </button>

                  <button
                    type="button"
                    onClick={() => updateRiskStatus(selectedRisk.id, 'Dismissed')}
                    className={cn(
                      'inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition-colors',
                      selectedRisk.status === 'Dismissed'
                        ? 'border-line-strong bg-subtle text-steel font-bold'
                        : 'border-line bg-panel text-steel hover:bg-subtle hover:text-navy',
                    )}
                  >
                    Dismiss
                  </button>

                  <button
                    type="button"
                    onClick={() => updateRiskStatus(selectedRisk.id, 'Resolved')}
                    className={cn(
                      'inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition-colors',
                      selectedRisk.status === 'Resolved'
                        ? 'border-positive bg-positive-soft text-positive font-bold'
                        : 'border-line bg-panel text-positive hover:bg-positive-soft',
                    )}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

              {/* Why it was detected */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold tracking-wider text-steel uppercase">
                  Why It Was Detected
                </h4>
                <div className="rounded-lg border border-line bg-panel p-3.5 text-sm leading-relaxed text-navy">
                  <p>{selectedRisk.whyDetected}</p>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold tracking-wider text-steel uppercase">
                  Recommended Action
                </h4>
                <div className="rounded-lg border border-primary/20 bg-primary-soft p-3.5 text-sm leading-relaxed text-primary-dark">
                  <p className="font-medium text-navy">Controller recommendation:</p>
                  <p className="mt-1">{selectedRisk.recommendedAction}</p>
                </div>
              </div>

              {/* Related Transaction */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold tracking-wider text-steel uppercase">
                    Related Transaction
                  </h4>
                  <Link
                    to="/transactions"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    View ledger <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>

                {selectedRisk.relatedTransaction ? (
                  <div className="rounded-lg border border-line bg-panel p-3.5 text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="figure font-semibold text-navy">
                        {selectedRisk.relatedTransaction.reference}
                      </span>
                      <span className="figure font-bold text-navy">
                        {formatMoney(selectedRisk.relatedTransaction.amount)}
                      </span>
                    </div>
                    <p className="text-xs text-steel">
                      {selectedRisk.relatedTransaction.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-mist pt-1 border-t border-line">
                      <span>Date: {formatDate(selectedRisk.relatedTransaction.date)}</span>
                      <span>Account: {selectedRisk.relatedTransaction.account}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-mist italic">No specific transaction linked</p>
                )}
              </div>

              {/* Related Invoice */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold tracking-wider text-steel uppercase">
                    Related Invoice
                  </h4>
                  <Link
                    to="/invoices"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    View invoices <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>

                {selectedRisk.relatedInvoice ? (
                  <div className="rounded-lg border border-line bg-panel p-3.5 text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="figure font-semibold text-navy">
                        {selectedRisk.relatedInvoice.number}
                      </span>
                      <span className="figure font-bold text-navy">
                        {formatMoney(selectedRisk.relatedInvoice.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-steel">
                      <span>Issued: {formatDate(selectedRisk.relatedInvoice.date)}</span>
                      <span>Due: {formatDate(selectedRisk.relatedInvoice.dueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-mist pt-1 border-t border-line">
                      <span>Counterparty: {selectedRisk.relatedInvoice.customerOrVendor}</span>
                      <span className="capitalize font-medium text-steel">
                        Status: {selectedRisk.relatedInvoice.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-mist italic">No specific invoice linked</p>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-line bg-subtle p-4 flex items-center justify-between">
              <span className="text-xs text-mist">
                Anomaly ID: <strong className="figure text-steel">{selectedRisk.id}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedRiskId(null)}
                className="rounded-md border border-line bg-panel px-4 py-1.5 text-xs font-semibold text-navy hover:bg-subtle"
              >
                Close Drawer
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
