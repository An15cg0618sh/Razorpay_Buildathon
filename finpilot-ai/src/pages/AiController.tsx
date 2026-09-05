import { Radar } from 'lucide-react';
import { NotYetBuilt } from '../components/NotYetBuilt';
import { PageHeading } from '../components/PageHeading';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Intentionally inert. The AI layer is explicitly out of scope for this step —
 * this page exists so the route, the nav entry and the shell are in place for
 * when it lands.
 */
export function AiController() {
  useDocumentTitle('AI controller');

  return (
    <>
      <PageHeading
        title="AI controller"
        lede="Ask questions of the ledger in plain language and have the answer cite the lines it came from."
      />

      <NotYetBuilt
        icon={Radar}
        summary="Nothing on this page is connected to a model. No prompt box is shown yet, because a box that cannot answer is worse than none."
        blockedOn="The controller needs the ledger database and the reconciliation history to read from before it can answer anything truthfully."
        planned={[
          'Answer questions like "why did facilities spend jump in August" with the lines behind the answer',
          'Draft the month-end commentary from the closed ledger, for a human to edit',
          'Propose a match or a category and explain the reasoning, leaving the decision with the controller',
          'Keep a record of every question asked and every action taken on its suggestion',
        ]}
      />
    </>
  );
}
