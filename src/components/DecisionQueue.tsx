import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Exception, RiskLevel } from '../types';
import { cn } from '../utils/cn';
import { formatMoney, formatDate } from '../utils/format';

const severityRule: Record<RiskLevel, string> = {
  critical: 'bg-critical',
  high: 'bg-critical',
  medium: 'bg-warning',
  low: 'bg-line-strong',
};

const severityLabel: Record<RiskLevel, string> = {
  critical: 'Critical severity',
  high: 'High severity',
  medium: 'Medium severity',
  low: 'Low severity',
};

interface DecisionQueueProps {
  items: Exception[];
  /** Cap the list; the dashboard shows a few, Risk centre shows all. */
  limit?: number;
}

/**
 * The queue of things a person has to rule on. This is the centre of the
 * product, so it gets the ruled-ledger treatment: reason on the left,
 * amount right-aligned in tabular figures, one row per decision.
 */
export function DecisionQueue({ items, limit }: DecisionQueueProps) {
  const visible = limit === undefined ? items : items.slice(0, limit);

  if (visible.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-steel sm:px-5">
        Nothing is waiting on you. The ledger is tied out for this period.
      </p>
    );
  }

  return (
    <ul>
      {visible.map((item) => (
        <li key={item.id} className="border-b border-line/70 last:border-b-0">
          <Link
            to={item.href}
            className="group flex items-stretch gap-0 transition-colors hover:bg-subtle"
          >
            <span
              aria-hidden="true"
              className={cn('w-[3px] shrink-0', severityRule[item.severity])}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-navy">{item.title}</span>
                  <span className="text-xs text-mist">{item.subject}</span>
                </span>
                <span className="mt-0.5 block text-xs text-steel">{item.reason}</span>
              </span>

              <span className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="flex flex-col sm:items-end">
                  {item.amount !== null && (
                    <span className="figure text-sm text-navy">
                      {formatMoney(item.amount)}
                    </span>
                  )}
                  <span className="text-xs text-mist">
                    <span className="sr-only">{severityLabel[item.severity]}, </span>
                    raised {formatDate(item.raisedOn)}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-mist transition-colors group-hover:text-primary"
                />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
