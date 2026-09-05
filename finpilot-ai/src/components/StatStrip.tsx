import type { Metric, Tone } from '../types';
import { cn } from '../utils/cn';

const valueTone: Record<Tone, string> = {
  neutral: 'text-navy',
  positive: 'text-positive',
  negative: 'text-critical',
  warning: 'text-warning',
};

interface StatStripProps {
  metrics: Metric[];
  className?: string;
}

/**
 * A single ruled row of figures, divided by vertical hairlines — closer to
 * the summary line of a trial balance than to a row of separate cards.
 *
 * The dividers are the grid's own 1px gap showing the rule colour through,
 * which stays correct at every column count and breakpoint.
 */
export function StatStrip({ metrics, className }: StatStripProps) {
  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-card sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {metrics.map((metric) => (
        <div key={metric.id} className="bg-panel px-4 py-4 sm:px-5">
          <dt className="text-xs text-steel">{metric.label}</dt>
          <dd
            className={cn('figure mt-1.5 text-xl font-medium', valueTone[metric.tone ?? 'neutral'])}
          >
            {metric.value}
          </dd>
          <p className="mt-1 text-xs text-mist">{metric.note}</p>
        </div>
      ))}
    </dl>
  );
}
