import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface PanelProps {
  title?: string;
  description?: string;
  /** Rendered on the right of the panel header — usually a link. */
  action?: ReactNode;
  children: ReactNode;
  /** Drop the inner padding when the panel holds a table or a ruled list. */
  flush?: boolean;
  className?: string;
}

/**
 * A white card on the canvas. A hairline plus a very shallow shadow does the
 * separating — no gradient, no blur, no heavy elevation.
 */
export function Panel({
  title,
  description,
  action,
  children,
  flush = false,
  className,
}: PanelProps) {
  const hasHeader = title !== undefined || action !== undefined;

  return (
    <section
      className={cn('overflow-hidden rounded-lg border border-line bg-panel shadow-card', className)}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title !== undefined && (
              <h2 className="text-sm font-semibold text-navy">{title}</h2>
            )}
            {description !== undefined && (
              <p className="mt-0.5 text-xs text-steel">{description}</p>
            )}
          </div>
          {action !== undefined && <div className="shrink-0 text-xs">{action}</div>}
        </header>
      )}
      <div className={flush ? undefined : 'px-4 py-4 sm:px-5'}>{children}</div>
    </section>
  );
}
