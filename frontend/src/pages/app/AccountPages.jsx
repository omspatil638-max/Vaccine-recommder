import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import { TextField } from '../../components/ui/FormField';
import Notice from '../../components/ui/Notice';
import PageHeader from '../../components/ui/PageHeader';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/format';
import { useResource } from '../../lib/useResource';

const SECTIONS = [
  { key: 'profile', title: 'About you', to: '/start/profile', describe: (d) => d.profile && `${d.profile.full_name}, born ${formatDate(d.profile.birth_date)}` },
  { key: 'location', title: 'Location', to: '/start/location', describe: (d) => d.location && [d.location.city, d.location.region, d.location.country_name].filter(Boolean).join(', ') },
  { key: 'health', title: 'Health', to: '/start/health', describe: (d) => d.health && `${Object.values(d.health.conditions).filter((v) => v === 'yes').length} condition(s) reported` },
  { key: 'history', title: 'Vaccination history', to: '/start/history', describe: (d) => `${d.records.length} dose(s) recorded` },
  { key: 'safety', title: 'Allergies and safety', to: '/start/safety', describe: (d) => d.safety && (d.safety.allergy_triage === 'yes' ? `${d.safety.allergies.length} allergy(ies)` : 'No allergies reported') },
];

export function ProfilePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data, error, loading } = useResource('/intake');
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  const rerun = async () => {
    setRunning(true);
    setRunError(null);
    try {
      await api.post('/assessments');
      navigate('/recommendations');
    } catch (err) {
      setRunError(err.message);
      setRunning(false);
    }
  };

  if (loading) return <DataState kind="loading" title="Loading your information…" />;
  if (error) return <DataState kind="error" title="We couldn’t load your information">{error.message}</DataState>;

  return (
    <>
      <PageHeader title="Your information" lede="Everything the assessment uses. Update anything that has changed." actions={<Button to="/settings" variant="secondary">Account settings</Button>} />
      {params.get('updated') && (
        <Notice tone="info" title="Your answers were saved" className="mb-8 max-w-3xl">
          <p>Re-check your vaccinations so your results reflect the change.</p>
          <div className="pt-2">
            <Button onClick={rerun} loading={running} loadingLabel="Re-checking…">
              Re-check my vaccinations
            </Button>
          </div>
          {runError && <p className="text-stop">{runError}</p>}
        </Notice>
      )}
      <ul className="max-w-3xl divide-y divide-rule border-y border-rule">
        {SECTIONS.map((s) => (
          <li key={s.key} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg">{s.title}</h2>
              <p className="text-sm text-ink-2">{s.describe(data) || 'Not answered'}</p>
            </div>
            <Link to={`${s.to}?return=profile`} className="inline-flex min-h-11 items-center text-sm">
              Edit<span className="visually-hidden"> {s.title.toLowerCase()}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function SettingsPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const logout = async () => {
    await auth.logout();
    navigate('/login', { replace: true });
  };

  const del = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Enter your password to confirm.');
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await api.post('/account/delete', { password });
      await auth.refresh().catch(() => {});
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" />
      <div className="max-w-2xl space-y-10">
        <section className="space-y-3">
          <h2 className="text-xl">Account</h2>
          <p className="text-ink-2">
            Signed in as <strong className="text-ink">{auth.user?.email}</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
            <Button variant="quiet" to="/forgot-password">
              Change password
            </Button>
          </div>
        </section>

        <section className="space-y-3 border-t border-rule pt-8">
          <h2 className="text-xl">Your data</h2>
          <p className="text-ink-2">Download everything we hold about you as a file you can keep or share with a professional.</p>
          <a href={api.url('/account/export')} className="inline-flex min-h-11 items-center rounded-sm border border-rule-strong px-4 text-sm font-semibold text-ink no-underline hover:bg-paper-2" download>
            Download my data (JSON)
          </a>
        </section>

        <section className="space-y-3 border-t border-rule pt-8">
          <h2 className="text-xl">Delete account</h2>
          <p className="text-ink-2">This permanently deletes your account and all your information. It can’t be undone.</p>
          {!confirming ? (
            <Button variant="danger" onClick={() => setConfirming(true)}>
              Delete my account
            </Button>
          ) : (
            <form onSubmit={del} noValidate className="space-y-4 rounded-md border border-stop/40 bg-stop-soft p-4">
              <TextField label="Enter your password to confirm" type="password" autoComplete="current-password" value={password} error={error} onChange={(e) => setPassword(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="danger" loading={deleting} loadingLabel="Deleting…">
                  Permanently delete
                </Button>
                <Button variant="secondary" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
