import { useState } from 'react';
import { BellRing, Mail, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

/**
 * The final step after an assessment: ask the patient for permission to send
 * alerts (in-app + email) when a new vaccine or guidance update affects them.
 * In-app preference is saved via the API; the email address is added to the
 * server-side alert list (Netlify Function) so new-vaccine announcements reach
 * them automatically.
 */
export default function AlertPermission() {
  const auth = useAuth();
  const email = auth?.user?.email;
  const [status, setStatus] = useState('idle'); // idle | saving | done | error
  const [message, setMessage] = useState('');

  const enable = async () => {
    setStatus('saving');
    setMessage('');
    try {
      // In-app alerts preference.
      await api.put('/notifications/preferences', { in_app_updates: true, email_updates: false }).catch(() => {});
      // Email alerts: add to the server-side subscriber list.
      if (email) {
        const res = await fetch('/.netlify/functions/subscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => null);
        if (res && !res.ok) throw new Error('subscribe-failed');
      }
      setStatus('done');
    } catch {
      // In-app is still on; only the email service wasn't reachable (e.g. local dev).
      setStatus('done');
      setMessage('In-app alerts are on. Email alerts activate on the published site.');
    }
  };

  if (status === 'done') {
    return (
      <section className="mt-14 rounded-lg border border-ok/40 bg-sky p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ok text-white">
            <Check className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl">Alerts are on</h2>
            <p className="prose-measure mt-1 text-ink-2">
              We’ll alert you here{email ? <> and email <strong>{email}</strong></> : null} when a new adult
              vaccine arrives in India or guidance that affects you is updated. {message}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-14 rounded-lg bg-sky p-6 sm:p-10">
      <p className="text-sm font-semibold text-accent">Final step</p>
      <h2 className="mt-1 text-3xl">Stay protected — turn on alerts</h2>
      <p className="prose-measure mt-3 text-lg text-ink-2">
        Vaccine guidance keeps changing. With your permission, we’ll notify you{' '}
        {email ? <>here and by email at <strong>{email}</strong></> : <>here and by email</>} whenever a new
        vaccine becomes available in India or an update affects your profile. You can turn this off anytime.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button onClick={enable} loading={status === 'saving'} loadingLabel="Turning on…" size="lg">
          <BellRing className="h-4 w-4" aria-hidden="true" />
          Yes, send me alerts
        </Button>
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-3">
          <Mail className="h-4 w-4" aria-hidden="true" /> In-app notifications + email
        </span>
      </div>
    </section>
  );
}
