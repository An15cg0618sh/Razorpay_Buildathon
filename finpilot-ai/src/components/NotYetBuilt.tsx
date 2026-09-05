import type { LucideIcon } from 'lucide-react';

interface NotYetBuiltProps {
  icon: LucideIcon;
  /** What this page is for, in the user's language. */
  summary: string;
  /** The capabilities that will land here. Not a sequence, so not numbered. */
  planned: string[];
  /** What has to exist before this page can work. */
  blockedOn: string;
}

/**
 * Placeholder for a page whose foundation exists but whose behaviour lands in
 * a later step. It states what the page will do and what it is waiting on,
 * rather than shrugging with "coming soon".
 */
export function NotYetBuilt({ icon: Icon, summary, planned, blockedOn }: NotYetBuiltProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel shadow-card">
      <div className="flex flex-col gap-4 px-4 py-6 sm:flex-row sm:gap-5 sm:px-6 sm:py-7">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="max-w-xl">
          <p className="text-sm text-navy">{summary}</p>
          <p className="mt-2 text-sm text-steel">{blockedOn}</p>
        </div>
      </div>

      <div className="border-t border-line">
        <h3 className="px-4 pt-4 pb-1 text-[0.6875rem] font-semibold tracking-[0.04em] text-mist uppercase sm:px-6">
          Planned for this page
        </h3>
        <ul>
          {planned.map((entry) => (
            <li
              key={entry}
              className="border-t border-line/70 px-4 py-3 text-sm text-steel first:border-t-0 sm:px-6"
            >
              {entry}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
