import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface PageHeadingProps {
  title: string;
  /** One plain sentence about what this page is for or what state it is in. */
  lede: string;
  /** Optional control on the right, e.g. a primary action. */
  action?: ReactNode;
  className?: string;
}

export function PageHeading({ title, lede, action, className }: PageHeadingProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6',
        className,
      )}
    >
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-[1.75rem]">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-steel">{lede}</p>
      </div>
      {action !== undefined && <div className="shrink-0">{action}</div>}
    </header>
  );
}
