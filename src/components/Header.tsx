import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { findNavGroup, findNavItem, navItems } from '../data/navigation';
import { countOpenExceptions, getCompany, getCurrentUser } from '../services/financeApi';
import { cn } from '../utils/cn';

interface HeaderProps {
  onOpenSidebar: () => void;
}

const PERIODS = ['Aug 2026', 'Jul 2026', 'Jun 2026'];

/** Shared shape for the two icon controls, so they sit on the same grid. */
const ICON_BUTTON =
  'relative flex h-9 w-9 items-center justify-center rounded-lg text-mist transition-colors duration-150 hover:bg-subtle hover:text-navy';

export function Header({ onOpenSidebar }: HeaderProps) {
  const { pathname } = useLocation();
  const company = getCompany();
  const user = getCurrentUser();
  const openExceptions = countOpenExceptions();

  // Local for now. Becomes shared app state once pages actually filter by period.
  const [period, setPeriod] = useState(PERIODS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const item = findNavItem(pathname);
  const group = findNavGroup(pathname);
  const searchResults = navItems.filter((navItem) => {
    const query = searchQuery.trim().toLowerCase();
    return query.length > 0 && `${navItem.label} ${navItem.hint}`.toLowerCase().includes(query);
  });

  const clearSearch = () => {
    setSearchQuery('');
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-panel px-3 sm:px-5">
      <button
        type="button"
        onClick={onOpenSidebar}
        className={cn(ICON_BUTTON, 'lg:hidden')}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Open navigation</span>
      </button>

      {/* Current page */}
      <div className="min-w-0">
        <p className="hidden text-[0.6875rem] font-medium tracking-[0.06em] text-mist uppercase sm:block">
          {group?.label ?? 'FinPilot AI'}
        </p>
        <p className="truncate text-[0.9375rem] font-semibold text-navy sm:text-base">
          {item?.label ?? 'Page not found'}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Reporting period */}
        <label className="relative hidden items-center lg:flex">
          <span className="sr-only">Reporting period</span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="figure cursor-pointer appearance-none rounded-lg border border-line bg-panel py-2 pr-7 pl-2.5 text-xs font-medium text-navy transition-colors duration-150 hover:border-line-strong"
          >
            {PERIODS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-mist"
          />
        </label>

        {/* Search stays local to the shell until a real index exists. */}
        <div className="relative">
          <button
            type="button"
            aria-label="Open search"
            onClick={() => setIsMobileSearchOpen((open) => !open)}
            className={cn(ICON_BUTTON, 'md:hidden')}
          >
            <Search className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
          </button>
          <label className="hidden w-52 items-center gap-2 rounded-lg border border-line px-2.5 py-2 text-left text-sm text-mist transition-colors duration-150 focus-within:border-primary hover:border-line-strong md:flex">
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">Search pages</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-mist"
            />
            <kbd className="figure rounded border border-line bg-subtle px-1 text-[0.625rem] text-mist">⌘K</kbd>
          </label>

          {searchQuery.trim() && (
            <div className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-64 overflow-hidden rounded-lg border border-line bg-panel p-1.5 shadow-raised">
              {searchResults.length > 0 ? searchResults.map((result) => (
                <Link
                  key={result.to}
                  to={result.to}
                  onClick={clearSearch}
                  className="block rounded-md px-3 py-2 transition-colors hover:bg-subtle"
                >
                  <span className="block text-sm font-medium text-navy">{result.label}</span>
                  <span className="block truncate text-xs text-mist">{result.hint}</span>
                </Link>
              )) : <p className="px-3 py-3 text-sm text-steel">No results found</p>}
            </div>
          )}

          {isMobileSearchOpen && (
            <div className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-line bg-panel p-2 shadow-raised md:hidden">
              <label className="flex items-center gap-2 rounded-md border border-line px-2.5 py-2 text-sm text-mist focus-within:border-primary">
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">Search pages</span>
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search pages"
                  className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-mist"
                />
              </label>
              {searchQuery.trim() && (searchResults.length > 0 ? searchResults.map((result) => (
                <Link key={result.to} to={result.to} onClick={clearSearch} className="block rounded-md px-3 py-2 hover:bg-subtle">
                  <span className="block text-sm font-medium text-navy">{result.label}</span>
                  <span className="block truncate text-xs text-mist">{result.hint}</span>
                </Link>
              )) : <p className="px-3 py-3 text-sm text-steel">No results found</p>)}
            </div>
          )}
        </div>

        {/* Notifications. The count is the real open-exception total. */}
        <Link
          to="/risk-center"
          title={`${openExceptions} items need a decision`}
          className={ICON_BUTTON}
        >
          <Bell className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
          {openExceptions > 0 && (
            <span
              aria-hidden="true"
              className="figure absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[0.625rem] font-semibold text-white"
            >
              {openExceptions}
            </span>
          )}
          <span className="sr-only">
            Notifications — {openExceptions} items need a decision
          </span>
        </Link>

        <span aria-hidden="true" className="mx-0.5 hidden h-8 w-px bg-line sm:block" />

        {/* Company, then the signed-in person. Square badge for the org, round
            avatar for the human. Below `sm` there is no room for the full name,
            so the badge carries it and this announces it. */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="sr-only sm:hidden">{company.name}</span>
          <span
            aria-hidden="true"
            title={company.name}
            className="figure flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-subtle text-[0.6875rem] font-semibold text-steel"
          >
            {company.initials}
          </span>
          <span className="hidden max-w-[13rem] min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate text-xs font-semibold text-navy">{company.name}</span>
            <span className="truncate text-[0.6875rem] text-mist">
              {company.openPeriod} open
            </span>
          </span>

          <Link
            to="/settings"
            title={`${user.name} · ${user.role}`}
            className="rounded-full transition-opacity hover:opacity-85"
          >
            <span
              aria-hidden="true"
              className="figure flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
            >
              {user.initials}
            </span>
            <span className="sr-only">
              {user.name}, {user.role} — account settings
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
