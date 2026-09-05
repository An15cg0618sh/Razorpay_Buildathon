import { ChevronsLeft, ChevronsRight, LogOut, X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { navGroups } from '../data/navigation';
import { getCompany, getCurrentUser } from '../services/financeApi';
import type { NavItem } from '../types';
import { cn } from '../utils/cn';
import { Logo } from './Logo';

interface SidebarProps {
  /** Mobile drawer. */
  isOpen: boolean;
  onClose: () => void;
  /** Desktop icon-only rail. */
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const EXPANDED = 'w-64';
const COLLAPSED = 'w-[4.5rem]';

/* One row of navigation. Shared by the rail and the drawer so the two can
   never drift apart. */
function NavRow({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <li>
      <NavLink
        to={item.to}
        onClick={onNavigate}
        title={collapsed ? `${item.label} — ${item.hint}` : item.hint}
        className={({ isActive }) =>
          cn(
            'group flex items-center rounded-lg text-sm transition-colors duration-150',
            collapsed ? 'mx-auto h-10 w-10 justify-center' : 'gap-2.5 px-2.5 py-2',
            isActive
              ? 'bg-primary-soft font-medium text-primary'
              : 'text-steel hover:bg-subtle hover:text-navy',
          )
        }
      >
        {({ isActive }) => (
          <>
            <item.icon
              aria-hidden="true"
              className={cn(
                'h-[1.125rem] w-[1.125rem] shrink-0 transition-colors',
                isActive ? 'text-primary' : 'text-mist group-hover:text-steel',
              )}
            />
            <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

interface SidebarBodyProps {
  collapsed: boolean;
  /** Present only in the mobile drawer. */
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

function SidebarBody({ collapsed, onClose, onToggleCollapse }: SidebarBodyProps) {
  const user = getCurrentUser();
  const company = getCompany();

  return (
    <>
      {/* Brand */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-line',
          collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-4',
        )}
      >
        <Link to="/dashboard" className="min-w-0 rounded-lg">
          <Logo markOnly={collapsed} />
        </Link>
        {onClose !== undefined && (
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded-lg p-1.5 text-mist transition-colors hover:bg-subtle hover:text-navy lg:hidden"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close navigation</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {navGroups.map((group, index) => (
          <div key={group.label} className={cn('px-2', index > 0 && 'mt-4')}>
            {/* Collapsed, a hairline stands in for the group heading so the
                sections stay legible without their labels. */}
            {collapsed && index > 0 && <div className="mx-auto mb-3 h-px w-8 bg-line" />}
            <h2
              className={cn(
                'text-[0.6875rem] font-semibold tracking-[0.06em] text-mist uppercase',
                collapsed ? 'sr-only' : 'px-2.5 pb-1.5',
              )}
            >
              {group.label}
            </h2>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavRow key={item.to} item={item} collapsed={collapsed} onNavigate={onClose} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse control — desktop only; the drawer is never collapsed. */}
      {onToggleCollapse !== undefined && (
        <div className="hidden shrink-0 border-t border-line p-2 lg:block">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex items-center rounded-lg text-sm text-steel transition-colors duration-150 hover:bg-subtle hover:text-navy',
              collapsed ? 'mx-auto h-10 w-10 justify-center' : 'w-full gap-2.5 px-2.5 py-2',
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-[1.125rem] w-[1.125rem] shrink-0 text-mist" aria-hidden="true" />
            ) : (
              <ChevronsLeft className="h-[1.125rem] w-[1.125rem] shrink-0 text-mist" aria-hidden="true" />
            )}
            <span className={collapsed ? 'sr-only' : ''}>Collapse</span>
          </button>
        </div>
      )}

      {/* Signed-in person */}
      <div className={cn('shrink-0 border-t border-line', collapsed ? 'p-2' : 'p-3')}>
        <div className={cn('flex items-center', collapsed ? 'flex-col gap-1' : 'gap-3')}>
          <Link
            to="/settings"
            title={collapsed ? `${user.name} · ${user.role}` : 'Account settings'}
            className={cn(
              'flex min-w-0 items-center rounded-lg transition-colors',
              collapsed ? 'justify-center p-1 hover:bg-subtle' : 'flex-1 gap-3',
            )}
          >
            <span
              aria-hidden="true"
              className="figure flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary"
            >
              {user.initials}
            </span>
            <span className={cn('min-w-0 flex-1 leading-tight', collapsed && 'sr-only')}>
              <span className="block truncate text-sm font-medium text-navy">{user.name}</span>
              <span className="block truncate text-xs text-mist">{user.role}</span>
            </span>
          </Link>

          <Link
            to="/login"
            title="Sign out"
            className="rounded-lg p-1.5 text-mist transition-colors hover:bg-subtle hover:text-navy"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Sign out</span>
          </Link>
        </div>

        {/* The header carries the company name on desktop; in the drawer this
            is the only place it appears. */}
        {onClose !== undefined && (
          <p className="mt-3 truncate border-t border-line pt-3 text-xs text-mist">{company.name}</p>
        )}
      </div>
    </>
  );
}

/* Keeps Tab inside the open drawer. The drawer claims aria-modal, so keyboard
   focus has to honour that claim rather than wandering behind it. */
function trapTab(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== 'Tab') return;

  const focusable = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [contenteditable], [tabindex]:not([tabindex="-1"])',
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;

  const active = document.activeElement;
  // The panel itself holds focus on open, so it counts as the start edge —
  // without this, Shift+Tab from the freshly opened drawer escapes behind it.
  const atStart = active === container || active === first;

  if (event.shiftKey && atStart) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * The drawer shell. Mounted only while open, so on open it takes focus and on
 * close it hands focus back to whatever opened it — otherwise the keyboard
 * would be left on a node that no longer exists.
 */
function MobileDrawer({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const opener = document.activeElement;
    const node = panel.current;
    node?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (node !== null) trapTab(event, node);
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop. Deliberately not focusable: it would sit outside the dialog
          in the tab order, and Escape plus the panel's own close button already
          give the keyboard a way out. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-navy/30"
      />
      <aside
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="animate-drawer-in absolute inset-y-0 left-0 flex w-[17rem] max-w-[85%] flex-col border-r border-line bg-panel shadow-drawer outline-none"
      >
        {children}
      </aside>
    </div>
  );
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* Desktop rail: always present from lg up, collapsible to icons. Sticky
          and viewport-tall so the footer stays put and the nav scrolls inside
          it, however long the page behind it gets. */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-line bg-panel transition-[width] duration-200 ease-out lg:sticky lg:top-0 lg:flex lg:h-dvh',
          isCollapsed ? COLLAPSED : EXPANDED,
        )}
      >
        <SidebarBody collapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
      </aside>

      {isOpen && (
        <MobileDrawer onClose={onClose}>
          <SidebarBody collapsed={false} onClose={onClose} />
        </MobileDrawer>
      )}
    </>
  );
}
