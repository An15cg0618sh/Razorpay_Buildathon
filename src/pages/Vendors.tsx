import { DataTable, type Column } from '../components/DataTable';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { StatusPill, riskTone } from '../components/StatusPill';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { listVendors } from '../services/financeApi';
import type { Vendor } from '../types';
import { formatDate, formatMoneyWhole } from '../utils/format';

const columns: Column<Vendor>[] = [
  {
    key: 'name',
    header: 'Vendor',
    render: (vendor) => (
      <span className="block">
        <span className="block text-navy">{vendor.name}</span>
        <span className="block text-xs text-mist">{vendor.category}</span>
      </span>
    ),
  },
  {
    key: 'owner',
    header: 'Relationship owner',
    hideBelow: 'md',
    render: (vendor) => <span className="text-steel">{vendor.owner}</span>,
  },
  {
    key: 'onboarded',
    header: 'Onboarded',
    hideBelow: 'lg',
    render: (vendor) => <span className="figure text-steel">{formatDate(vendor.onboardedOn)}</span>,
  },
  {
    key: 'terms',
    header: 'Terms',
    align: 'right',
    render: (vendor) => (
      <span className="figure text-steel">{vendor.paymentTermsDays} days</span>
    ),
  },
  {
    key: 'spend',
    header: 'Spend this year',
    align: 'right',
    render: (vendor) => (
      <span className="figure text-navy">{formatMoneyWhole(vendor.spendYtd)}</span>
    ),
  },
  {
    key: 'risk',
    header: 'Risk',
    align: 'right',
    render: (vendor) => <StatusPill tone={riskTone[vendor.risk]}>{vendor.risk}</StatusPill>,
  },
];

export function Vendors() {
  useDocumentTitle('Vendors');
  const rows = listVendors();

  return (
    <>
      <PageHeading
        title="Vendors"
        lede="Who you pay, on what terms, and how much of the year's spend each one accounts for."
      />

      <Panel
        title={`${rows.length} vendors`}
        description="Sample data · risk scores are hand-set until the scoring service lands"
        flush
      >
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(vendor) => vendor.id}
          minWidth="54rem"
        />
      </Panel>
    </>
  );
}
