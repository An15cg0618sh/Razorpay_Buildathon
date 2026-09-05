import {
  ArrowLeftRight,
  Building2,
  FileText,
  LayoutDashboard,
  Receipt,
  Scale,
  Settings,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { NavGroup, NavItem } from '../types';

/**
 * Single source of truth for the sidebar.
 *
 * Every `to` here has a matching <Route> in src/App.tsx — the route paths are
 * unchanged from the foundation build, only the grouping and labels moved.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
        hint: 'What needs a decision today',
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      {
        label: 'Transactions',
        to: '/transactions',
        icon: ArrowLeftRight,
        hint: 'Every line that hit a bank account',
      },
      { label: 'Invoices', to: '/invoices', icon: FileText, hint: 'Receivables and their ageing' },
      { label: 'Expenses', to: '/expenses', icon: Receipt, hint: 'Claims and card spend' },
      {
        label: 'Reconciliation',
        to: '/reconciliation',
        icon: Scale,
        hint: 'Tie the bank to the books',
      },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      {
        label: 'Risk Center',
        to: '/risk-center',
        icon: ShieldAlert,
        hint: 'Exposure and breaches',
      },
      { label: 'Cash Flow', to: '/cash-flow', icon: TrendingUp, hint: 'Runway and movement' },
      {
        label: 'AI Controller',
        to: '/ai-controller',
        icon: Sparkles,
        hint: 'Ask questions of the ledger',
      },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Vendors', to: '/vendors', icon: Building2, hint: 'Who you pay, and on what terms' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings, hint: 'Company, team and periods' },
    ],
  },
];

/** Flat list, handy for lookups and for asserting route coverage. */
export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

export function findNavItem(pathname: string): NavItem | undefined {
  return navItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
}

/** The group a path sits in, for the header's context line. */
export function findNavGroup(pathname: string): NavGroup | undefined {
  return navGroups.find((group) =>
    group.items.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`)),
  );
}
