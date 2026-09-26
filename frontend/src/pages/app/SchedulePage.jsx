import { useState } from 'react';
import { Link } from 'react-router';
import { Bell, CalendarClock, Check, MessageCircleWarning, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import { TextField } from '../../components/ui/FormField';
import Notice from '../../components/ui/Notice';
import PageHeader from '../../components/ui/PageHeader';
import { api } from '../../lib/api';
import { daysFromToday, formatDate, relativeDay, todayIso } from '../../lib/format';
import { useResource } from '../../lib/useResource';

const KIND_ICON = { due_now: Bell, next_dose: CalendarClock, review: MessageCircleWarning, custom: CalendarClock };

/** Where a reminder sits on the timeline: past due / today, later, or needing advice. */
function nodeState(r) {
  if (r.status !== 'open') return 'closed';
  if (r.kind === 'review') return 'review';
  if (!r.dueDate) return 'later';
  return daysFromToday(r.dueDate) <= 0 ? 'now' : 'later';
}

const NODE = {
  now: 'border-accent bg-accent text-on-accent',
  later: 'border-accent bg-paper text-accent',
  review: 'border-caution bg-caution-soft text-caution',
  closed: 'border-rule-strong bg-paper-2 text-ink-3',
};

const NODE_LABEL = { now: 'Due now', later: 'Later', review: 'Check with a professional', closed: '' };

/**
 * One stop on the vertical timeline: the date in the margin, a node on the
 * line, then what it is and what you can do about it.
 */
function ReminderItem({ r, onChange, last }) {
  const [busy, setBusy] = useState(null);
  const state = nodeState(r);
  const Icon = state === 'review' ? MessageCircleWarning : state === 'closed' ? Check : KIND_ICON[r.kind] ?? CalendarClock;
  const set = async (status) => {
    setBusy(status);
    try {
      await api.patch(`/reminders/${r.id}`, { status });
      onChange();
    } finally {
      setBusy(null);
    }
  };
  return (
    <li className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 pb-10 last:pb-0 sm:grid-cols-[10.5rem_2.25rem_minmax(0,1fr)]">
      <p className="hidden pt-1.5 text-right text-sm sm:block">
        {r.dueDate ? (
          <>
            <span className="data block whitespace-nowrap font-semibold text-ink">{formatDate(r.dueDate)}</span>
            <span className="block text-ink-3">{relativeDay(r.dueDate)}</span>
          </>
        ) : (
          <span className="text-ink-3">No date</span>
        )}
      </p>
      <div className="relative flex justify-center">
        {!last && <span className="absolute top-10 -bottom-10 w-0.5 rounded-full bg-rule" aria-hidden="true" />}
        <span className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 ${NODE[state]}`} aria-hidden="true">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="min-w-0 space-y-2 pt-1">
        {NODE_LABEL[state] && <p className="text-xs font-semibold text-ink-2">{NODE_LABEL[state]}</p>}
        <p className={`font-display text-lg font-bold ${r.status !== 'open' ? 'text-ink-3 line-through' : 'text-ink'}`}>{r.title}</p>
        <p className="text-sm text-ink-2">
          <span className="sm:hidden">
            {r.dueDate ? (
              <>
                <span className="data">{formatDate(r.dueDate)}</span> · {relativeDay(r.dueDate)}
              </>
            ) : (
              'No date'
            )}
            {r.detail && ' · '}
          </span>
          {r.detail}
        </p>
        <p className="text-xs text-ink-3">
          {r.origin === 'schedule' ? 'Generated from your schedule' : 'Added by you'}
          {r.vaccineId && (
            <>
              {' · '}
              <Link to={`/vaccines/${r.vaccineId}`}>About this vaccine</Link>
            </>
          )}
        </p>
        {r.status === 'open' ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="secondary" onClick={() => set('done')} loading={busy === 'done'} loadingLabel="Saving…">
              <Check className="h-4 w-4" aria-hidden="true" /> Done
            </Button>
            <Button variant="quiet" onClick={() => set('dismissed')} loading={busy === 'dismissed'} loadingLabel="…">
              <X className="h-4 w-4" aria-hidden="true" /> Dismiss
            </Button>
          </div>
        ) : (
          <Button variant="quiet" className="-ml-2" onClick={() => set('open')}>
            Restore
          </Button>
        )}
      </div>
    </li>
  );
}

function Timeline({ items, onChange }) {
  return (
    <ol className="max-w-3xl">
      {items.map((r, i) => (
        <ReminderItem key={r.id} r={r} onChange={onChange} last={i === items.length - 1} />
      ))}
    </ol>
  );
}

const byDate = (a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');

function AddReminder({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', due_date: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Enter what to remind you about.';
    if (!form.due_date) errs.due_date = 'Choose a date.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await api.post('/reminders', { title: form.title.trim(), due_date: form.due_date });
      setForm({ title: '', due_date: '' });
      setOpen(false);
      onAdded();
    } finally {
      setSaving(false);
    }
  };

  if (!open)
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Add a reminder
      </Button>
    );
  return (
    <form onSubmit={submit} noValidate className="max-w-xl space-y-4 rounded-md border border-rule bg-paper-2 p-4">
      <TextField label="Remind me to…" placeholder="Book my second dose" maxLength={120} value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <div className="max-w-xs">
        <TextField label="On" type="date" min={todayIso()} value={form.due_date} error={errors.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={saving} loadingLabel="Saving…">
          Save reminder
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function SchedulePage() {
  const { data, error, loading, reload } = useResource('/reminders');
  const open = (data ?? []).filter((r) => r.status === 'open').sort(byDate);
  const closed = (data ?? []).filter((r) => r.status !== 'open').sort(byDate);

  return (
    <>
      <PageHeader
        title="Your schedule"
        lede="Upcoming doses and reminders, worked out from your recorded vaccinations and the guideline’s dose intervals."
        actions={<Button to="/record">Record a vaccination</Button>}
      />
      <Notice tone="info" className="mb-8 max-w-3xl">
        Reminders appear here when you visit. We don’t send emails or notifications yet.
      </Notice>
      {loading && <DataState kind="loading" title="Loading reminders…" />}
      {error && <DataState kind="error" title="We couldn’t load your reminders">{error.message}</DataState>}
      {data && (
        <div className="space-y-10">
          <section aria-labelledby="upcoming">
            <h2 id="upcoming" className="mb-8 text-2xl">
              Coming up
            </h2>
            {open.length ? (
              <Timeline items={open} onChange={reload} />
            ) : (
              <DataState kind="empty" title="Nothing scheduled">
                When a dose is due or coming up, it will appear here.
              </DataState>
            )}
            <div className="mt-10 sm:pl-[15rem]">
              <AddReminder onAdded={reload} />
            </div>
          </section>
          {closed.length > 0 && (
            <section aria-labelledby="closed">
              <h2 id="closed" className="mb-8 text-xl">
                Done and dismissed
              </h2>
              <Timeline items={closed} onChange={reload} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
