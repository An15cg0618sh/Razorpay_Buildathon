/**
 * Joins class names and drops anything falsy, so conditional Tailwind
 * classes stay readable without pulling in clsx.
 *
 *   cn('px-3', isActive && 'text-primary')
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
