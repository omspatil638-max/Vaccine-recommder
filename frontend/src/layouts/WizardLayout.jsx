import { Outlet, useLocation, useNavigate } from 'react-router';
import Wordmark from './Wordmark';
import StepProgress from '../components/ui/StepProgress';
import Button from '../components/ui/Button';
import { INTAKE_STEPS } from '../features/intake/steps';
import { IntakeProvider } from '../features/intake/IntakeContext';
import { useAuth } from '../lib/auth';

/**
 * Intake chrome: wordmark, progress and "Save and exit" only — no global nav,
 * so attention stays on the current step. Each step saves to the server when
 * you continue, so leaving and coming back resumes where you were.
 */
export default function WizardLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const current = INTAKE_STEPS.find((s) => pathname.startsWith(s.path))?.key ?? INTAKE_STEPS[0].key;
  const completed = new Set(auth.progress?.completed ?? []);
  const onboarded = auth.progress?.onboardingComplete;

  const exit = async () => {
    if (onboarded) {
      navigate('/home');
      return;
    }
    await auth.logout();
    navigate('/login');
  };

  return (
    <IntakeProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="border-b border-rule bg-paper-2">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-2 sm:px-6 md:pb-4">
          <div className="flex items-center justify-between gap-4">
            <Wordmark to={onboarded ? '/home' : `/start/${auth.progress?.nextStep ?? 'profile'}`} />
            <Button variant="quiet" onClick={exit}>
              {onboarded ? 'Back to home' : 'Save and exit'}
            </Button>
          </div>
          <StepProgress steps={INTAKE_STEPS} current={current} completed={completed} />
        </div>
      </header>
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <Outlet />
        </div>
      </main>
    </IntakeProvider>
  );
}
