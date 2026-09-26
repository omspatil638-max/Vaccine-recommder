import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import PageHeader from '../../components/ui/PageHeader';
import { api } from '../../lib/api';
import { formatDate, formatDateTime } from '../../lib/format';
import { useCatalog, useResource } from '../../lib/useResource';

const TABS = [
  { key: 'vaccinations', label: 'Vaccinations' },
  { key: 'assessments', label: 'Assessments' },
  { key: 'saved', label: 'Saved' },
  { key: 'changes', label: 'Changes' },
];

const OUTCOME = {
  COMPLETE: 'Completed',
  NO_GUIDELINE: 'No guideline for location',
  POPULATION_NOT_COVERED: 'Group not covered',
  INSUFFICIENT_INFORMATION: 'More information needed',
};

const ENTITY = {
  account: 'Account',
  profile: 'Personal details',
  location: 'Location',
  health: 'Health information',
  vaccination_history: 'Vaccination history answers',
  vaccination_record: 'Vaccination record',
  safety: 'Allergy and safety answers',
  assessment: 'Assessment',
  onboarding: 'Setup',
  reminder: 'Reminder',
  saved_provider: 'Saved provider',
  saved_vaccine: 'Saved vaccine',
};

function Vaccinations() {
  const { data, error, loading, reload } = useResource('/intake');
  const { catalog } = useCatalog();
  const [removing, setRemoving] = useState(null);
  const names = Object.fromEntries(Object.values(catalog?.vaccinesBySet ?? {}).flat().map((v) => [v.id, v.name]));

  if (loading) return <DataState kind="loading" title="Loading…" />;
  if (error) return <DataState kind="error" title="We couldn’t load your vaccinations">{error.message}</DataState>;
  const records = [...data.records].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  const remove = async (id) => {
    setRemoving(id);
    try {
      await api.del(`/intake/records/${id}`);
      reload();
    } finally {
      setRemoving(null);
    }
  };

  if (!records.length)
    return (
      <DataState kind="empty" title="No vaccinations recorded" action={<Button to="/record">Record a vaccination</Button>}>
        Recording doses helps us work out what’s next for you.
      </DataState>
    );

  return (
    <ol className="relative space-y-0 border-l border-rule pl-6">
      {records.map((r) => (
        <li key={r.id} className="relative pb-6">
          <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-accent bg-paper" aria-hidden="true" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="data text-sm text-ink-2">{r.date ? formatDate(r.date, r.date_precision) : 'Date unknown'}</p>
              <p className="font-medium">{names[r.vaccine_id] ?? r.vaccine_id}</p>
              <p className="text-sm text-ink-3">
                {[r.dose_number && `Dose ${r.dose_number}`, r.provider_text, r.data_status === 'USER_REPORTED' && 'Reported by you']
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button to={`/record/${r.id}/aftercare`} variant="quiet">
                After-care
              </Button>
              <Button variant="quiet" onClick={() => remove(r.id)} loading={removing === r.id} loadingLabel="Removing…" aria-label={`Remove ${names[r.vaccine_id] ?? r.vaccine_id} record`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Assessments() {
  const { data, error, loading } = useResource('/assessments');
  if (loading) return <DataState kind="loading" title="Loading…" />;
  if (error) return <DataState kind="error" title="We couldn’t load your assessments">{error.message}</DataState>;
  if (!data.length) return <DataState kind="empty" title="No assessments yet" />;
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {data.map((a, i) => (
        <li key={a.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">
              {formatDateTime(a.createdAt)} {i === 0 && <span className="text-sm text-ink-3">(latest)</span>}
            </p>
            <p className="text-sm text-ink-2">
              {OUTCOME[a.outcome]}
              {a.counts && ` · ${a.counts.RECOMMENDED ?? 0} recommended, ${a.counts.REVIEW_WITH_PROFESSIONAL ?? 0} to check with a professional`}
              {' · '}
              {a.trigger === 'dose_recorded' ? 'after a vaccination was recorded' : 'run by you'}
            </p>
            <p className="text-xs text-ink-3">
              Guideline version <span className="data">{a.guidelineVersion ?? '—'}</span> · engine <span className="code">{a.engineVersion}</span>
            </p>
          </div>
          <Link to={i === 0 ? '/recommendations' : `/recommendations?run=${a.id}`} className="text-sm">
            View results
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Saved() {
  const { data, error, loading } = useResource('/saved');
  if (loading) return <DataState kind="loading" title="Loading…" />;
  if (error) return <DataState kind="error" title="We couldn’t load saved items">{error.message}</DataState>;
  if (!data.length)
    return (
      <DataState kind="empty" title="Nothing saved yet">
        Save providers from their page to find them again here.
      </DataState>
    );
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {data.map((s) => (
        <li key={s.id} className="py-3">
          <Link to={s.kind === 'provider' ? `/providers/${s.ref}` : `/vaccines/${s.ref}`}>
            {s.kind === 'provider' ? 'Provider' : 'Vaccine'}: {s.ref}
          </Link>
          <span className="ml-2 text-sm text-ink-3">saved {formatDate(s.createdAt.slice(0, 10))}</span>
        </li>
      ))}
    </ul>
  );
}

function Changes() {
  const { data, error, loading } = useResource('/activity');
  if (loading) return <DataState kind="loading" title="Loading…" />;
  if (error) return <DataState kind="error" title="We couldn’t load your activity">{error.message}</DataState>;
  if (!data.length) return <DataState kind="empty" title="No changes recorded" />;
  return (
    <>
      <p className="mb-4 text-sm text-ink-3">We log what changed and when, not the values themselves.</p>
      <ul className="divide-y divide-rule border-y border-rule">
        {data.map((e) => (
          <li key={e.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
            <span>
              {ENTITY[e.entity] ?? e.entity} {e.action.replace('_', ' ')}
              {e.fields?.length > 0 && e.entity !== 'assessment' && (
                <span className="text-sm text-ink-3"> · {e.fields.length} field{e.fields.length > 1 ? 's' : ''}</span>
              )}
            </span>
            <span className="data text-sm text-ink-3">{formatDateTime(e.at)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function HistoryPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'vaccinations';

  return (
    <>
      <PageHeader title="History" lede="Your vaccinations, past assessments, saved places and changes to your information." actions={<Button to="/record">Record a vaccination</Button>} />
      <div role="tablist" aria-label="History sections" className="mb-8 flex gap-1 overflow-x-auto border-b border-rule">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setParams({ tab: t.key })}
            className={`inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-3 text-sm ${
              tab === t.key ? 'border-accent font-semibold text-ink' : 'border-transparent text-ink-2 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'vaccinations' && <Vaccinations />}
        {tab === 'assessments' && <Assessments />}
        {tab === 'saved' && <Saved />}
        {tab === 'changes' && <Changes />}
      </div>
    </>
  );
}
