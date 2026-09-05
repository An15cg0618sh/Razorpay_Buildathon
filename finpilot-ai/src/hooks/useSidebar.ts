import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarState {
  /** Mobile drawer visibility. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Desktop icon-only rail. */
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

/**
 * Drives both sidebar behaviours.
 *
 * The drawer only matters below `lg`: it closes on navigation and on Escape,
 * and locks background scrolling while open. The collapsed rail only matters
 * from `lg` up. Collapse is kept in component state, so it survives navigation
 * (the layout stays mounted) but resets on a full reload — persisting it needs
 * a stored user preference, which belongs with the settings work.
 */
export function useSidebar(): SidebarState {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { pathname } = useLocation();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);
  const toggleCollapse = useCallback(() => setIsCollapsed((current) => !current), []);

  // Picking a destination should dismiss the drawer.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Reaching `lg` swaps the drawer for the rail in CSS. Without this the drawer
  // would stay "open" behind a display:none, holding the scroll lock on with no
  // visible control to release it.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)');

    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) setIsOpen(false);
    }

    desktop.addEventListener('change', handleChange);
    return () => desktop.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return { isOpen, open, close, toggle, isCollapsed, toggleCollapse };
}
