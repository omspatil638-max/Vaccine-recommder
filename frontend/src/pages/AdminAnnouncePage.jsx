import React, { useState } from 'react';
import { Send, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Megaphone } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import vaccines from '../data/vaccines.json';

/**
 * Admin-only page to announce a new vaccine and email every subscriber — no
 * terminal needed. It calls the same `announce` Netlify Function the command
 * line would, protected by the ADMIN_TOKEN the admin types in. The token is
 * only sent to our own function and is never stored.
 */
export default function AdminAnnouncePage() {
  const [form, setForm] = useState({
    token: '',
    type: 'new',
    title: '',
    summary: '',
    vaccineId: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.token.trim()) return setError('Enter your admin token.');
    if (!form.title.trim() || !form.summary.trim()) return setError('Title and summary are required.');
    setStatus('sending');
    try {
      const res = await fetch('/.netlify/functions/announce', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-token': form.token.trim() },
        body: JSON.stringify({
          type: form.type,
          title: form.title.trim(),
          summary: form.summary.trim(),
          vaccineId: form.vaccineId || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
      setResult(data);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(
        err.message === 'Failed to fetch'
          ? 'Could not reach the alert service. This works on the published site (smartvax.netlify.app), not local preview.'
          : err.message,
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs items={[{ label: 'Admin — Send Alert' }]} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Announce a new vaccine</h1>
            <p className="text-xs text-slate-500">Emails every subscriber automatically and updates the site.</p>
          </div>
        </div>

        {status === 'done' ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
              <div className="text-sm text-emerald-900">
                <p className="font-semibold">Announcement sent.</p>
                <ul className="mt-2 space-y-1">
                  <li>Subscribers on the list: <strong>{result?.subscribers ?? 0}</strong></li>
                  <li>Emails sent: <strong>{result?.sent ?? 0}</strong>{result?.failed ? `, failed: ${result.failed}` : ''}</li>
                  <li>Email service configured: <strong>{result?.emailConfigured ? 'Yes' : 'No'}</strong></li>
                  {result?.provider && <li>Sending via: <strong>{result.provider === 'smtp' ? 'SMTP (Gmail/Brevo)' : 'Resend'}</strong></li>}
                </ul>
                <p className="mt-3 text-xs text-emerald-800">
                  {!result?.emailConfigured
                    ? 'No email provider is active. Add SMTP (Gmail) or Resend env vars in Netlify and redeploy.'
                    : result?.sent === 0
                      ? 'No subscribers yet — subscribe an email first (turn on alerts in an account, or the reminders page).'
                      : result?.provider === 'smtp'
                        ? 'Sent to every subscriber. Check the inbox (and spam folder) of each subscribed email — SMTP delivers to any address.'
                        : 'Sent. Note: without a verified Resend domain, Resend only delivers to your own Resend account email. For other inboxes, set up Gmail SMTP.'}
                  {result?.failed ? ` Some sends failed${result?.lastError ? `: ${result.lastError}` : ''}.` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setStatus('idle'); setResult(null); }}
              className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin token</label>
              <input
                type="password"
                value={form.token}
                onChange={set('token')}
                placeholder="the ADMIN_TOKEN you set in Netlify"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Update type</label>
                <select value={form.type} onChange={set('type')} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                  <option value="new">New vaccine</option>
                  <option value="updated">Guidance updated</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Related vaccine (optional)</label>
                <select value={form.vaccineId} onChange={set('vaccineId')} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                  <option value="">— none —</option>
                  {vaccines.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. New dengue vaccine available in India"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Summary</label>
              <textarea
                value={form.summary}
                onChange={set('summary')}
                rows={3}
                placeholder="A short message for patients. Discuss with your doctor."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            {error && (
              <p className="flex items-start gap-1.5 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send alert to all subscribers
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Your token is sent only to our own service and never stored.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
