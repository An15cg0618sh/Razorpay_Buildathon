import type { CashPoint } from '../types';
import { formatMoneyCompact } from '../utils/format';

interface CashBarsProps {
  points: CashPoint[];
}

/**
 * Money in against money out, month by month. Plain divs rather than a
 * charting library — six bars do not justify a dependency.
 */
export function CashBars({ points }: CashBarsProps) {
  const ceiling = Math.max(...points.flatMap((point) => [point.inflow, point.outflow]), 1);

  return (
    <figure className="m-0">
      <div className="flex items-end gap-3 sm:gap-5">
        {points.map((point) => {
          const net = point.inflow - point.outflow;

          return (
            <div key={point.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="flex h-28 w-full items-end justify-center gap-[3px] border-b border-line"
                title={`${point.month}: ${formatMoneyCompact(point.inflow)} in, ${formatMoneyCompact(point.outflow)} out`}
              >
                <div
                  className="w-1/2 max-w-3 rounded-t-[2px] bg-positive"
                  style={{ height: `${Math.max((point.inflow / ceiling) * 100, 2)}%` }}
                />
                <div
                  className="w-1/2 max-w-3 rounded-t-[2px] bg-critical"
                  style={{ height: `${Math.max((point.outflow / ceiling) * 100, 2)}%` }}
                />
              </div>
              <span className="text-xs text-steel">{point.month}</span>
              <span
                className={`figure text-[0.6875rem] ${net >= 0 ? 'text-positive' : 'text-critical'}`}
              >
                {net >= 0 ? '+' : ''}
                {formatMoneyCompact(net)}
              </span>
            </div>
          );
        })}
      </div>

      <figcaption className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-steel">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-sm bg-positive" />
          Received
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-sm bg-critical" />
          Paid out
        </span>
        <span className="ml-auto text-mist">September is part-month</span>
      </figcaption>
    </figure>
  );
}
