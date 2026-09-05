import { Link, useLocation } from 'react-router-dom';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { navGroups } from '../data/navigation';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFound() {
  useDocumentTitle('Page not found');
  const { pathname } = useLocation();

  return (
    <>
      <PageHeading
        title="No page at that address"
        lede={`Nothing is routed to ${pathname}. It may have been renamed, or the link may be out of date.`}
      />

      <Panel title="Where you can go instead" flush>
        <ul>
          {navGroups.flatMap((group) =>
            group.items.map((item) => (
              <li key={item.to} className="border-b border-line/70 last:border-b-0">
                <Link
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-subtle sm:px-5"
                >
                  <item.icon aria-hidden="true" className="h-4 w-4 shrink-0 text-mist" />
                  <span className="min-w-0">
                    <span className="block text-sm text-navy">{item.label}</span>
                    <span className="block text-xs text-mist">{item.hint}</span>
                  </span>
                </Link>
              </li>
            )),
          )}
        </ul>
      </Panel>
    </>
  );
}
