import { LineChart } from 'lucide-react';
import { CashBars } from '../components/CashBars';
import { NotYetBuilt } from '../components/NotYetBuilt';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { StatStrip } from '../components/StatStrip';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getCashOnHand, getRunwayMonths, listCashHistory } from '../services/financeApi';
import type { Metric } from '../types';
import { formatMoneyCompact } from '../utils/format';

export function CashFlow() {
  useDocumentTitle('Cash flow');

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
