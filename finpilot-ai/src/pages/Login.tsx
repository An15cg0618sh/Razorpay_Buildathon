import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getCurrentUser } from '../services/financeApi';

/**
 * Sign-in screen. There is no auth backend yet, so the form navigates
 * straight to the dashboard — deliberately, and the screen says so.
 */
export function Login() {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const user = getCurrentUser();

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel shadow-card">
      <div className="border-b border-line px-6 py-5">
        <Logo />
      </div>

      <form
        className="px-6 py-6"
        onSubmit={(event) => {
          event.preventDefault();
          navigate('/dashboard');
        }}
      >
        <h1 className="text-lg font-semibold text-navy">Sign in to FinPilot AI</h1>
        <p className="mt-1 text-sm text-steel">
          Accounts are not wired up yet. Continue to open the controller with sample data.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-steel">Work email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              defaultValue={user.email}
              className="rounded-lg border border-line bg-subtle px-3 py-2 text-sm text-navy transition-colors placeholder:text-mist hover:border-line-strong"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-steel">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              defaultValue="not-checked-yet"
              className="rounded-lg border border-line bg-subtle px-3 py-2 text-sm text-navy transition-colors placeholder:text-mist hover:border-line-strong"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-dark"
        >
          Open the controller
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>

        <p className="mt-4 text-center text-xs text-mist">
          Nothing you type here is sent anywhere.{' '}
          <Link to="/dashboard" className="text-steel underline underline-offset-2">
            Skip to the dashboard
          </Link>
        </p>
      </form>
    </div>
  );
}
