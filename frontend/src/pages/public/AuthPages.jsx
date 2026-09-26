import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import Button from '../../components/ui/Button';
import { TextField } from '../../components/ui/FormField';
import Notice from '../../components/ui/Notice';
import { api } from '../../lib/api';
import { homePathFor, useAuth } from '../../lib/auth';
import { useFieldErrors } from '../../lib/useFieldErrors';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** The four moments of the journey, in the order the product walks through them. */
const JOURNEY = [
  { title: 'Your answers', text: 'About you, your health, past vaccinations and allergies.' },
  { title: 'Your country’s guideline', text: 'Checked with fixed rules against the official schedule.' },
  { title: 'A result you can follow', text: 'What may be relevant, why, and what needs a professional.' },
  { title: 'Where to go next', text: 'Providers, dose timing and reminders.' },
];

/**
 * The journey as a connected progression — the product's one visual on the
 * way in. The last node is open: the next step is the reader's.
 */
function JourneyFigure() {
  return (
    <figure className="rounded-md bg-deep-2 p-6 sm:p-7">
      <figcaption className="mb-6 text-sm font-semibold text-on-deep-muted">How it works</figcaption>
      <ol>
        {JOURNEY.map((step, i) => {
          const last = i === JOURNEY.length - 1;
          return (
            <li key={step.title} className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-4 pb-6 last:pb-0">
              {!last && <span className="absolute left-[9px] top-6 bottom-0 w-0.5 rounded-full bg-accent-bright/40" aria-hidden="true" />}
              <span
                className={`relative mt-1 h-5 w-5 rounded-full border-2 border-accent-bright ${last ? 'bg-deep-2' : 'bg-accent-bright'}`}
                aria-hidden="true"
              />
              <div>
                <p className="font-display font-bold text-on-deep">{step.title}</p>
                <p className="text-sm text-on-deep-muted">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

function AuthShell({ title, lede, children, footer }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,24rem)] md:items-start md:gap-14 md:py-14">
      <div className="space-y-8 rounded-lg bg-deep p-7 text-on-deep sm:p-10 md:p-12">
        <div className="space-y-4">
          <p className="text-display font-display font-extrabold text-on-deep">
            Your vaccinations, <span className="text-accent-bright">explained.</span>
          </p>
          <p className="prose-measure text-lg text-on-deep-muted sm:text-xl">
            Answer a few questions. We check them against your country’s official guideline and show what may be
            relevant, why, and where to go next.
          </p>
        </div>
        <div className="hidden md:block">
          <JourneyFigure />
        </div>
        <p className="hidden text-sm text-on-deep-muted md:block">
          Information to support a conversation with a healthcare professional, not a diagnosis or prescription.{' '}
          <Link to="/about/sources">How it works and our sources</Link>
        </p>
      </div>
      <section aria-labelledby="auth-title" className="space-y-6 md:pt-10">
        <header className="space-y-2">
          <h1 id="auth-title" className="text-2xl">
            {title}
          </h1>
          {lede && <p className="text-ink-2">{lede}</p>}
        </header>
        {children}
        {footer && <div className="border-t border-rule pt-5 text-sm text-ink-2">{footer}</div>}
      </section>
    </div>
  );
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useFieldErrors(form);
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter an email address like name@example.com.';
    if (!form.password) e.password = 'Enter your password.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const me = await auth.login(form.email.trim(), form.password);
      const next = params.get('next');
      navigate(next && next.startsWith('/') && me.progress.onboardingComplete ? next : homePathFor(me.progress), {
        replace: true,
      });
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      lede="Continue where you left off."
      footer={
        <>
          New here? <Link to="/signup">Create an account</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {formError && <Notice tone="error">{formError}</Notice>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="submit" size="lg" loading={loading} loadingLabel="Signing in…" className="w-full sm:w-auto">
            Sign in
          </Button>
          <Link to="/forgot-password" className="text-sm">
            Forgot your password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function SignupPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = useFieldErrors(form);
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter an email address like name@example.com.';
    if (form.password.length < 10) e.password = 'Use at least 10 characters.';
    if (form.confirm !== form.password) e.confirm = 'The passwords don’t match.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const me = await auth.signup(form.email.trim(), form.password);
      navigate(homePathFor(me.progress), { replace: true });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.fieldErrors ?? {});
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create an account"
      lede="Your answers are saved to your account so you can come back and update them."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {formError && <Notice tone="error">{formError}</Notice>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 10 characters. A short phrase is easier to remember."
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          error={errors.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
        <Button type="submit" size="lg" loading={loading} loadingLabel="Creating account…" className="w-full sm:w-auto">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter an email address like name@example.com.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      setResult(await api.post('/auth/forgot', { email: email.trim() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      lede="Enter the email you signed up with and we’ll send you a link."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      {result ? (
        <div className="space-y-4">
          <Notice tone="ok" title="Check your email">
            {result.message}
          </Notice>
          {result.demoResetLink && (
            <Notice tone="demo" title="Demo mode: no email service is connected">
              <p>In this demo, use this link to reset the password:</p>
              <a href={result.demoResetLink} className="break-all">
                Open the reset link
              </a>
            </Notice>
          )}
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            error={error}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={loading} loadingLabel="Sending…">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useFieldErrors(form);
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (form.password.length < 10) e.password = 'Use at least 10 characters.';
    if (form.confirm !== form.password) e.confirm = 'The passwords don’t match.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      const me = await auth.resetPassword(token, form.password);
      navigate(homePathFor(me.progress), { replace: true });
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Reset your password" footer={<Link to="/forgot-password">Request a new link</Link>}>
        <Notice tone="error">This reset link is incomplete. Request a new one.</Notice>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" footer={<Link to="/login">Back to sign in</Link>}>
      <form onSubmit={submit} noValidate className="space-y-5">
        {formError && <Notice tone="error">{formError}</Notice>}
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 10 characters."
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          error={errors.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
        <Button type="submit" loading={loading} loadingLabel="Saving…">
          Save new password
        </Button>
      </form>
    </AuthShell>
  );
}
