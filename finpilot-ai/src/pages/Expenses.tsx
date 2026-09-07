import { DataTable, type Column } from '../components/DataTable';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { StatusPill, expenseStatusTone } from '../components/StatusPill';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePeriod } from '../hooks/usePeriod';
import { listExpenses } from '../services/financeApi';
import type { Expense } from '../types';
import { formatDate, formatMoney } from '../utils/format';

const columns: Column<Expense>[] = [
  {
    key: 'date',
    header: 'Date',
    render: (expense) => <span className="figure text-steel">{formatDate(expense.date)}</span>,
  },
  {
    key: 'merchant',
    header: 'Merchant',
    render: (expense) => (
      <span className="block">
        <span className="block text-navy">{expense.merchant}</span>
        <span className="block text-xs text-mist">{expense.category}</span>
      </span>
    ),
  },
  {
    key: 'submittedBy',
    header: 'Claimed by',
    hideBelow: 'md',
    render: (expense) => <span className="text-steel">{expense.submittedBy}</span>,
  },
  {
    key: 'receipt',
    header: 'Receipt',
    hideBelow: 'sm',
    render: (expense) =>
      expense.hasReceipt ? (
        <span className="text-steel">Attached</span>
      ) : (
        <span className="text-critical">Missing</span>
      ),
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (expense) => (
      <span className="figure text-navy">{formatMoney(expense.amount)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    align: 'right',
    render: (expense) => (
      <StatusPill tone={expenseStatusTone[expense.status]}>{expense.status}</StatusPill>
    ),
  },
];

export function Expenses() {
  useDocumentTitle('Expenses');
  const [period] = usePeriod();
  const rows = listExpenses();
  const missingReceipts = rows.filter((expense) => !expense.hasReceipt).length;

  return (
    <>
      <PageHeading
        title="Expenses"
        lede={`Claims and card spend for ${period}. ${missingReceipts} claims are still missing a receipt.`}
      />

      <Panel
        title={`${rows.length} claims`}
        description="Sample data · approvals and reimbursement runs arrive with the workflow service"
        flush
      >
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(expense) => expense.id}
          minWidth="52rem"
        />
      </Panel>
    </>
  );
}
