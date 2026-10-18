import { useCallback, useEffect, useState } from 'react';
import { Bell, Check, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import Notice from '../../components/ui/Notice';
import PageHeader from '../../components/ui/PageHeader';
import { api } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState(null);
  const [items, setItems] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [emailDelivery, setEmailDelivery] = useState('disabled');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async (checkForUpdates = false) => {
    setRefreshing(true);
    setError(null);
    try {
      if (checkForUpdates) {
        const sync = await api.post('/notifications/sync');
        setEmailDelivery(sync.emailDelivery);
      }
      const result = await api.get('/notifications');
      setItems(result.items);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    api.get('/notifications/preferences').then(setPreferences).catch((err) => setError(err.message));
    refresh();
  }, [refresh]);

  const updatePreference = (field, value) => setPreferences((current) => ({ ...current, [field]: value }));
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      setPreferences(await api.put('/notifications/preferences', {
        in_app_updates: preferences.inAppUpdates,
        email_updates: preferences.emailUpdates,
      }));
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const markRead = async (item) => {
    try {
      await api.patch(`/notifications/${item.id}`, { read: !item.read });
      setItems((current) => current.map((n) => n.id === item.id ? { ...n, read: !item.read } : n));
      setUnreadCount((count) => count + (item.read ? 1 : -1));
    } catch (err) {
      setError(err.message);
    }
  };

  return <div className="space-y-10">
    <PageHeader title="Vaccine update alerts" lede="See new or changed vaccine information that may match your latest check. Alerts are prompts to review the source and talk with your clinician, not a direction to get vaccinated." />

    {error && <Notice tone="error" title="We couldn’t update your alerts">{error}</Notice>}
    {emailDelivery === 'not_configured' && <Notice tone="demo" title="Email alerts aren’t available yet">In-app alerts work. Email delivery will appear here after the service is configured.</Notice>}
    {emailDelivery === 'retry_later' && <Notice tone="info" title="An email could not be sent">We’ll try again the next time your account checks for updates.</Notice>}
    {saved && <Notice tone="ok" title="Alert preferences saved" />}

    <section aria-labelledby="alert-settings" className="max-w-3xl border-y border-rule py-6">
      <div className="mb-5 flex items-start gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent"><Bell className="h-5 w-5" aria-hidden="true" /></span><div><h2 id="alert-settings" className="text-xl">How should we notify you?</h2><p className="mt-1 text-sm text-ink-2">You can change these choices any time.</p></div></div>
      {preferences ? <form onSubmit={save} className="space-y-5">
        <label className="flex items-start gap-3 rounded-md border border-rule p-4"><input type="checkbox" checked={preferences.inAppUpdates} onChange={(e) => updatePreference('inAppUpdates', e.target.checked)} className="mt-1 h-4 w-4 accent-blue-700" /><span><span className="flex items-center gap-2 font-semibold"><Bell className="h-4 w-4" aria-hidden="true" />In-app alerts</span><span className="mt-1 block text-sm text-ink-2">Show new, medically reviewed updates in your account.</span></span></label>
        <label className={`flex items-start gap-3 rounded-md border border-rule p-4 ${preferences.emailAvailable ? '' : 'bg-paper-2'}`}><input type="checkbox" checked={preferences.emailUpdates} disabled={!preferences.emailAvailable} onChange={(e) => updatePreference('emailUpdates', e.target.checked)} className="mt-1 h-4 w-4 accent-blue-700" /><span><span className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4" aria-hidden="true" />Email alerts</span><span className="mt-1 block text-sm text-ink-2">Send alerts to <strong>{preferences.email}</strong> when an update matches your latest assessment.</span>{!preferences.emailAvailable && <span className="mt-1 block text-xs text-ink-3">Email delivery hasn’t been configured on this service yet.</span>}</span></label>
        <Button type="submit" loading={saving} loadingLabel="Saving…">Save alert preferences</Button>
      </form> : <DataState kind="loading" title="Loading alert preferences…" />}
    </section>

    <section aria-labelledby="your-alerts" className="max-w-3xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-accent">Your account</p><h2 id="your-alerts" className="mt-1 text-2xl">Recent updates{unreadCount > 0 ? <span className="ml-2 align-middle text-sm font-medium text-ink-3">{unreadCount} unread</span> : null}</h2></div><Button variant="secondary" onClick={() => refresh(true)} loading={refreshing} loadingLabel="Checking…"><RefreshCw className="h-4 w-4" aria-hidden="true" />Check for updates</Button></div>
      {items === null ? <DataState kind="loading" title="Checking for updates…" /> : items.length === 0 ? <DataState kind="empty" title="You’re all caught up">When a medically reviewed vaccine update matches your latest assessment, it will appear here.</DataState> : <ol className="divide-y divide-rule border-y border-rule">{items.map((item) => <li key={item.id} className={`py-5 ${item.read ? '' : 'bg-sky/40'}`}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-accent">{item.kind === 'new' ? 'New vaccine information' : 'Guidance updated'} <span className="font-normal text-ink-3">· {formatDateTime(item.createdAt)}</span></p><h3 className="mt-2 text-lg">{item.title}</h3><p className="mt-2 text-sm leading-6 text-ink-2">{item.summary}</p>{item.relevantToAssessment === true ? <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink-2"><ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />This update matched your latest assessment. Confirm what it means with a clinician.</p> : <p className="mt-3 text-sm text-ink-3">Review the source with your clinician to see whether it applies to you.</p>}{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold">Read the source</a>}</div><button type="button" onClick={() => markRead(item)} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-semibold text-accent hover:bg-paper-2" aria-label={item.read ? 'Mark as unread' : 'Mark as read'}>{item.read ? 'Unread' : <><Check className="h-4 w-4" aria-hidden="true" />Read</>}</button></div></li>)}</ol>}
      <p className="mt-4 max-w-2xl text-xs leading-5 text-ink-3">The account checks while you’re signed in. A scheduled service worker can also check opted-in accounts in the background. Every alert must be reviewed, linked to a source, and mapped to the correct country guideline before it can match your assessment.</p>
    </section>
  </div>;
}
