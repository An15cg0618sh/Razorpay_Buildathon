import { ShieldAlert } from 'lucide-react';
import { DecisionQueue } from '../components/DecisionQueue';
import { NotYetBuilt } from '../components/NotYetBuilt';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { listExceptions } from '../services/financeApi';

export function RiskCenter() {
  useDocumentTitle('Risk centre');
  const items = listExceptions();
  const high = items.filter((item) => item.severity === 'high').length;

  return (
    <>
      <PageHeading
        title="Risk centre"
        lede={`Everything the controller has flagged, most severe first. ${high} items are high severity.`}
      />

      <Panel title="Open exceptions" description="Across payments, receivables and expenses" flush>
        <DecisionQueue items={items} />
      </Panel>

      <NotYetBuilt
        icon={ShieldAlert}
        summary="These exceptions are a fixed sample set. Nothing is detected live yet."
        blockedOn="Detection needs the rules engine and transaction history in the database."
        planned={[
          'Detect duplicate payments, terms breaches and unusual spend as transactions arrive',
          'Let a controller resolve, snooze or escalate an exception with a note',
          'Track exposure by vendor and by category over time',
          'Notify the owner when something crosses a threshold they set',
        ]}
      />
    </>
  );
}
