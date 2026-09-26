import { Suspense, lazy, useCallback, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowRight, Bookmark, BookmarkCheck, Clock, FlaskConical, MapPin } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import { SelectField } from '../../components/ui/FormField';
import Notice from '../../components/ui/Notice';
import PageHeader from '../../components/ui/PageHeader';
import { DemoBadge } from '../../components/ui/StatusBadge';
import { AvailabilityState, CostBreakdown } from '../../components/ui/Availability';
import { api } from '../../lib/api';
import { useCatalog, useResource } from '../../lib/useResource';

const ProviderMap = lazy(() => import('../../features/providers/ProviderMap'));

/**
 * One line, not a box: the demo state is already marked in the app chrome and
 * on every provider, so the page-level note states the consequence plainly.
 */
function DemoNotice({ notice }) {
  return (
    <p className="flex items-start gap-2 text-sm text-demo">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        <span className="font-semibold">Demo data.</span>{' '}
        {notice ?? 'These providers are simulated. They are not real places, and their availability and prices are invented.'}
      </span>
    </p>
  );
}

function useVaccineNames() {
  const { catalog } = useCatalog();
  return Object.fromEntries(Object.values(catalog?.vaccinesBySet ?? {}).flat().map((v) => [v.id, v.shortName]));
}

function money(price) {
  return new Intl.NumberFormat(price.currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: price.currency }).format(
    price.total,
  );
}

/**
 * One place in the list. Four zones, always in the same order: where it is,
 * whether it has the vaccine, what it may cost, what to do next. Rows are
 * separated by rules, not boxed, so the list reads as a directory.
 */
function ProviderRow({ p, vaccine, names }) {
  const services = vaccine ? p.services.filter((s) => s.vaccine_id === vaccine) : p.services;
  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 border-t border-rule py-7">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent" aria-hidden="true">
        <MapPin className="h-4 w-4" />
      </span>
      <div className="min-w-0 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl">
              <Link to={`/providers/${p.id}`} className="text-ink no-underline hover:underline">
                {p.name}
              </Link>
            </h2>
            <p className="text-sm text-ink-2">
              {p.type}
              {p.distanceKm != null && (
                <>
                  {' · '}
                  <span className="data font-medium text-ink">{p.distanceKm} km</span> away
                </>
              )}
              {p.address && <> · {p.address}</>}
            </p>
          </div>
          <DemoBadge className="self-start" />
        </div>

        <dl className="divide-y divide-rule rounded-md border border-rule">
          {services.map((s) => (
            <div
              key={s.vaccine_id}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6"
            >
              <dt className="font-medium">{names[s.vaccine_id] ?? s.vaccine_id}</dt>
              <dd>
                <span className="visually-hidden">Availability: </span>
                <AvailabilityState state={s.state} lastVerified={s.last_verified} />
              </dd>
              <dd className="text-sm sm:text-right">
                <span className="visually-hidden">Cost: </span>
                {s.price ? (
                  <span className="data">
                    <span className="font-semibold text-ink">{money(s.price)}</span> <span className="text-ink-3">est. total</span>
                  </span>
                ) : (
                  <span className="text-ink-3">Price not available</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {p.hours[0]?.join(' ')}
              {p.hours.length > 1 && ' …'}
            </span>
            <span>{p.walk_in ? 'Walk-ins listed' : 'Contact before visiting'}</span>
          </p>
          <Link to={`/providers/${p.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold">
            Details, cost and contact
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </li>
  );
}

export function ProvidersPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const vaccine = params.get('vaccine') ?? '';
  const [view, setView] = useState('list');
  const { data, error, loading, reload } = useResource(`/providers${vaccine ? `?vaccine=${vaccine}` : ''}`);
  const latest = useResource('/assessments/latest');
  const names = useVaccineNames();
  const select = useCallback((id) => navigate(`/providers/${id}`), [navigate]);

  const relevant = (latest.data?.result?.results ?? []).filter((r) => ['RECOMMENDED', 'MAY_BE_APPROPRIATE', 'REVIEW_WITH_PROFESSIONAL'].includes(r.status));
  const vaccineOptions = (latest.data?.result?.results ?? []).map((r) => ({ value: r.vaccineId, label: r.shortName }));

  return (
    <>
      <PageHeader
        title="Where you may be able to get vaccinated"
        lede="Places that may offer the vaccinations relevant to you, with availability and cost where we have them."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-[minmax(0,18rem)_auto] sm:items-end sm:justify-between">
        <SelectField
          label="Vaccine"
          placeholder="All vaccines"
          options={vaccineOptions}
          value={vaccine}
          onChange={(e) => setParams(e.target.value ? { vaccine: e.target.value } : {})}
        />
        {data?.hasLocation && data?.providers?.length > 0 && (
          <div className="flex gap-1" role="group" aria-label="View">
            {['list', 'map'].map((v) => (
              <Button key={v} variant={view === v ? 'primary' : 'secondary'} aria-pressed={view === v} onClick={() => setView(v)}>
                {v === 'list' ? 'List' : 'Map'}
              </Button>
            ))}
          </div>
        )}
      </div>

      {relevant.length > 0 && !vaccine && (
        <p className="mb-6 text-sm text-ink-2">
          Relevant to you:{' '}
          {relevant.map((r, i) => (
            <span key={r.vaccineId}>
              {i > 0 && ', '}
              <Link to={`/providers?vaccine=${r.vaccineId}`}>{r.shortName}</Link>
            </span>
          ))}
        </p>
      )}

      {loading && <DataState kind="loading" title="Looking for providers…" />}
      {error && (
        <DataState kind="error" title="We couldn’t load providers" action={<Button variant="secondary" onClick={reload}>Try again</Button>}>
          {error.message}
        </DataState>
      )}
      {data && data.state === 'DATA_UNAVAILABLE' && (
        <DataState kind="unavailable" title="Vaccination provider availability could not be verified">
          {data.notice}
        </DataState>
      )}
      {data && data.dataOrigin === 'DEMO' && (
        <div className="space-y-6">
          <DemoNotice notice={data.notice} />
          {!data.hasLocation && (
            <Notice tone="info" title="Distances aren’t shown">
              You haven’t shared an approximate location. <Link to="/start/location?return=profile">Add it</Link> to sort
              providers by distance and see a map.
            </Notice>
          )}
          {data.providers.length === 0 ? (
            <DataState kind="empty" title="No providers found for this vaccine in our demo data">
              This doesn’t mean it isn’t available near you. A pharmacist, your doctor or your local health service can tell you
              where to get it.
            </DataState>
          ) : (
            <>
              {view === 'map' && (
                <Suspense fallback={<DataState kind="loading" title="Loading map…" />}>
                  <ProviderMap providers={data.providers} onSelect={select} />
                </Suspense>
              )}
              <ul className="border-b border-rule">
                {data.providers.map((p) => (
                  <ProviderRow key={p.id} p={p} vaccine={vaccine} names={names} />
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}

export function ProviderPage() {
  const { providerId } = useParams();
  const { data: p, error, loading } = useResource(`/providers/${providerId}`);
  const saved = useResource('/saved');
  const names = useVaccineNames();
  const [saving, setSaving] = useState(false);

  if (loading) return <DataState kind="loading" title="Loading provider…" />;
  if (error)
    return (
      <DataState kind="unavailable" title="We couldn’t find this provider" action={<Button to="/providers" variant="secondary">Back to providers</Button>}>
        {error.message}
      </DataState>
    );

  const savedItem = saved.data?.find((s) => s.kind === 'provider' && s.ref === p.id);
  const toggleSave = async () => {
    setSaving(true);
    try {
      if (savedItem) await api.del(`/saved/${savedItem.id}`);
      else await api.post('/saved', { kind: 'provider', ref: p.id });
      saved.reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        back={{ to: '/providers', label: 'All providers' }}
        title={p.name}
        lede={p.type}
        actions={
          <Button variant="secondary" onClick={toggleSave} loading={saving} loadingLabel="Saving…" aria-pressed={Boolean(savedItem)}>
            {savedItem ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
            {savedItem ? 'Saved' : 'Save provider'}
          </Button>
        }
      >
        <DemoBadge />
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-8">
          <DemoNotice notice={p.notice} />
          <section aria-labelledby="avail" className="space-y-4">
            <h2 id="avail" className="text-2xl">
              Availability and cost
            </h2>
            <ul className="divide-y divide-rule border-y border-rule">
              {p.services.map((s) => (
                <li key={s.vaccine_id} className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_16rem]">
                  <div className="space-y-1">
                    <h3 className="text-lg">{names[s.vaccine_id] ?? s.vaccine_id}</h3>
                    <AvailabilityState state={s.state} lastVerified={s.last_verified} />
                    <p className="text-xs text-ink-3">Source: {s.source}</p>
                  </div>
                  <CostBreakdown price={s.price} />
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink-3">
              Prices can differ with insurance or public programmes. Always confirm with the provider.
            </p>
          </section>
        </div>

        <aside className="space-y-6 text-sm">
          <section className="space-y-2">
            <h2 className="text-lg">Location</h2>
            <p className="inline-flex items-start gap-2 text-ink-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {p.address}
              {p.distanceKm != null && ` · ${p.distanceKm} km away`}
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg">Opening hours</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {p.hours.map(([d, h]) => (
                <div key={d} className="contents">
                  <dt className="text-ink-2">{d}</dt>
                  <dd className="data">{h}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-ink-3">Demo hours, not verified.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg">Contact and booking</h2>
            <p className="text-ink-2">
              This is a demo record, so there are no real contact details. Online booking isn’t connected; for a real provider
              you’d contact them directly.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg">Had your vaccination?</h2>
            <Button to="/record" variant="secondary">
              Record a vaccination
            </Button>
          </section>
        </aside>
      </div>
    </>
  );
}
