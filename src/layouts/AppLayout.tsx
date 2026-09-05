import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useSidebar } from '../hooks/useSidebar';

/**
 * The signed-in shell: a collapsible rail on the left from `lg` up, a sticky
 * top header, and the scrolling content area. Below `lg` the rail becomes a
 * drawer opened from the header.
 */
export function AppLayout() {
  const sidebar = useSidebar();

  return (
    <div className="flex min-h-dvh bg-canvas">
      {/* Ten nav items sit before the content in the tab order, so give the
          keyboard a way past them. */}
      <a href="#content" className="skip-link">
        Skip to content
      </a>

      <Sidebar
        isOpen={sidebar.isOpen}
        onClose={sidebar.close}
        isCollapsed={sidebar.isCollapsed}
        onToggleCollapse={sidebar.toggleCollapse}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenSidebar={sidebar.open} />

        <main
          id="content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8"
        >
          <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-6">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-line px-4 py-4 text-xs text-mist sm:px-6 lg:px-8">
          FinPilot AI · foundation build. Figures on every page are sample data.
        </footer>
      </div>
    </div>
  );
}
