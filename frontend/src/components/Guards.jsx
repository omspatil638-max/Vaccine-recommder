import { Navigate, Outlet, useLocation } from 'react-router';
import { homePathFor, useAuth } from '../lib/auth';
import DataState from './ui/DataState';
import Button from './ui/Button';
import { INTAKE_STEPS } from '../features/intake/steps';

function Loading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <DataState kind="loading" title="Loading…" />
    </div>
  );
}

function ServiceDown() {
  const { refresh } = useAuth();
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <DataState
        kind="error"
        title="We can’t reach the service right now"
        action={
          <Button variant="secondary" onClick={() => refresh().catch(() => {})}>
            Try again
          </Button>
        }
      >
        Your information is safe. Please check your connection, or try again in a moment.
      </DataState>
    </div>
  );
}

/** Sends visitors to where they belong: sign-in, their next intake step, or home. */
export function IndexRedirect() {
  const auth = useAuth();
  if (auth.status === 'loading') return <Loading />;
  if (auth.status === 'error') return <ServiceDown />;
  return <Navigate to={auth.status === 'authed' ? homePathFor(auth.progress) : '/login'} replace />;
}

/** For sign-in / sign-up pages: signed-in users skip ahead. */
export function GuestOnly() {
  const auth = useAuth();
  if (auth.status === 'loading') return <Loading />;
  if (auth.status === 'authed') return <Navigate to={homePathFor(auth.progress)} replace />;
  return <Outlet />;
}

export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === 'loading') return <Loading />;
  if (auth.status === 'error') return <ServiceDown />;
  if (auth.status !== 'authed') {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <Outlet />;
}

/** The intake wizard can't be skipped ahead of the first unfinished step. */
export function IntakeGate() {
  const { progress } = useAuth();
  const { pathname } = useLocation();
  if (progress?.onboardingComplete) return <Outlet />;
  const order = INTAKE_STEPS.map((s) => s.key);
  const current = order.findIndex((k) => pathname.startsWith(`/start/${k}`));
  const next = order.indexOf(progress?.nextStep ?? 'profile');
  if (current > next) return <Navigate to={`/start/${order[next]}`} replace />;
  return <Outlet />;
}

/** App pages need a finished intake; otherwise resume it. */
export function RequireOnboarded() {
  const { progress } = useAuth();
  if (!progress?.onboardingComplete) return <Navigate to={homePathFor(progress)} replace />;
  return <Outlet />;
}
