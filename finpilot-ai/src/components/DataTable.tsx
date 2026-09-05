import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: T) => ReactNode;
  /** Hide on narrow screens when the column is secondary. */
  hideBelow?: 'sm' | 'md' | 'lg';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Shown in place of the table when there is nothing to list. */
  emptyMessage?: string;
  /** Table keeps this width and scrolls horizontally below it. */
  minWidth?: string;
}

const hideClasses = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
} as const;

/**
 * A ruled table: hairline row separators, right-aligned figures, and
 * horizontal scroll rather than squashed columns on small screens.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage = 'Nothing to show for this period.',
  minWidth = '46rem',
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-steel sm:px-5">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line bg-subtle">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.04em] text-steel uppercase sm:px-5',
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.hideBelow !== undefined && hideClasses[column.hideBelow],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-line/70 transition-colors last:border-b-0 hover:bg-subtle"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3 align-middle sm:px-5',
                    column.align === 'right' ? 'text-right' : 'text-left',
                    column.hideBelow !== undefined && hideClasses[column.hideBelow],
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
