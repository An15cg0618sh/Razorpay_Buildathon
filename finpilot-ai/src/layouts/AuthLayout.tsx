import { Outlet } from 'react-router-dom';

/** Centred, chrome-free shell for the signed-out screens. */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
      <p className="mt-8 text-center text-xs text-mist">
        FinPilot AI · foundation build. No accounts exist yet.
      </p>
    </div>
  );
}
