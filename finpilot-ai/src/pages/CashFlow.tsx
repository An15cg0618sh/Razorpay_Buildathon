import { LineChart } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CashBars } from '../components/CashBars';
import { NotYetBuilt } from '../components/NotYetBuilt';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { StatStrip } from '../components/StatStrip';
import { dashboardCashFlow } from '../data/mockData';
import type { CashFlowRange } from '../data/dashboardTypes';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getCashOnHand, getRunwayMonths, listCashHistory } from '../services/financeApi';
import type { Metric } from '../types';
import { formatMoneyCompact } from '../utils/format';

const VALID_PERIODS: CashFlowRange[] = ['7D', '30D', '90D'];

export function CashFlow() {
  useDocumentTitle('Cash flow');
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse and normalize incoming query parameter ?period=7d / 30d / 90d
  const paramPeriod = searchParams.get('period')?.toUpperCase() as CashFlowRange | undefined;
  const activePeriod: CashFlowRange = paramPeriod && VALID_PERIODS.includes(paramPeriod)
    ? paramPeriod
    : '30D';

  const handlePeriodChange = (nextPeriod: CashFlowRange) => {
    setSearchParams({ period: nextPeriod.toLowerCase() });
  };

  const cashFlowTimeline = dashboardCashFlow[activePeriod];
  const points = listCashHistory();
  const runway = getRunwayMonths();

  const received = points.reduce((total, point) => total + point.inflow, 0);
  const paidOut = points.reduce((total, point) => total + point.outflow, 0);

  const metrics: Metric[] = [
    {
      id: 'on-hand',
      label: 'Cash on hand',
      value: formatMoneyCompact(getCashOnHand()),
      note: 'As at 4 Sep 2026',
    },
    {
      id: 'received',
      label: 'Received, six months',
      value: formatMoneyCompact(received),
      note: 'Customer receipts and refunds',
      tone: 'positive',
    },
    {
      id: 'paid',
      label: 'Paid out, six months',
      value: formatMoneyCompact(paidOut),
      note: 'Payroll, vendors and cards',
      tone: 'negative',
    },
    {
      id: 'runway',
      label: 'Runway',
      value: runway === null ? 'Cash positive' : `${runway} months`,
      note: 'At the current 30-day burn',
      tone: 'warning',
    },
  ];

  return (
    <>
      <PageHeading
        title="Cash flow"
        lede="Where cash went over the last six months, and how long the current balance lasts at this burn."
      />

      <StatStrip metrics={metrics} />

      <Panel
        title="Movement across your accounts"
        description={`${activePeriod} cash movement timeline`}
        action={
          <div className="range-tabs" role="group" aria-label="Cash flow range">
            {VALID_PERIODS.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handlePeriodChange(option)}
                className={activePeriod === option ? 'active' : ''}
              >
                {option}
              </button>
            ))}
          </div>
        }
      >
        <div className="flex flex-wrap gap-4 text-xs text-steel pb-2">
          <span><i className="legend-dot bg-[#0f9f94]" />Inflow</span>
          <span><i className="legend-dot bg-[#e36b5d]" />Outflow</span>
          <span><i className="legend-dot bg-[#4d78e8]" />Net cash</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowTimeline} margin={{ top: 16, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="cfInflowFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f9f94" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0f9f94" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cfOutflowFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e36b5d" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#e36b5d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#edf0f3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 11 }} tickFormatter={(value: number) => `₹${Math.round(value / 1000)}k`} />
              <Tooltip contentStyle={{ border: '1px solid #e4e7ec', borderRadius: 8, boxShadow: '0 4px 12px rgb(16 24 40 / 0.08)', fontSize: 12 }} />
              <Area type="monotone" dataKey="inflow" stroke="#0f9f94" strokeWidth={2} fill="url(#cfInflowFill)" />
              <Area type="monotone" dataKey="outflow" stroke="#e36b5d" strokeWidth={2} fill="url(#cfOutflowFill)" />
              <Area type="monotone" dataKey="net" stroke="#4d78e8" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Money in and out" description="Six months to September 2026">
        <CashBars points={points} />
      </Panel>

      <NotYetBuilt
        icon={LineChart}
        summary="History only. There is no forecast on this page yet, so the runway figure is a straight-line estimate."
        blockedOn="Forecasting needs committed invoices and scheduled payments out of the database."
        planned={[
          'Project the closing balance day by day from committed receivables and payables',
          'Warn ahead of a date where the balance cannot cover payroll',
          'Compare the forecast against what actually happened, month on month',
          'Model a scenario by moving a payment date or a collection assumption',
        ]}
      />
    </>
  );
}
