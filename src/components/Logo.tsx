import { cn } from '../utils/cn';

interface LogoProps {
  className?: string;
}

/**
 * A compass needle on a solid tile — FinPilot points the controller at what
 * matters. Inline SVG, so there is no image asset or extra dependency, and it
 * reads clearly at 28px in the collapsed rail.
 */
export function LogoMark({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('h-8 w-8 shrink-0', className)}
      fill="none"
    >
      <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
      <path d="M16 6.5 L21 18 L16 15.6 Z" fill="#ffffff" />
      <path d="M16 25.5 L11 14 L16 16.4 Z" fill="#ffffff" fillOpacity="0.55" />
      <circle cx="16" cy="16" r="1.5" fill="#ffffff" />
    </svg>
  );
}

interface LogoLockupProps extends LogoProps {
  /** Hide the wordmark, for the collapsed sidebar rail. */
  markOnly?: boolean;
}

/** Logo plus name, for the sidebar head and the login screen. */
export function Logo({ className, markOnly = false }: LogoLockupProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className={cn('flex min-w-0 flex-col leading-tight', markOnly && 'sr-only')}>
        <span className="truncate text-[0.9375rem] font-semibold tracking-tight text-navy">
          FinPilot AI
        </span>
        <span className="truncate text-[0.6875rem] text-mist">AI Finance Controller</span>
      </span>
    </span>
  );
}
