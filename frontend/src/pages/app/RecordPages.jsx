import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import DoseTimeline from '../../components/ui/DoseTimeline';
import PageHeader from '../../components/ui/PageHeader';
import { SourceList } from '../../components/ui/Provenance';
import DoseForm from '../../features/records/DoseForm';
import { formatDate } from '../../lib/format';
import { timingSummary } from '../../lib/results';
import { useCatalog, useResource } from '../../lib/useResource';
import { EmergencyHelp } from './VaccinePages';

export function RecordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { catalog } = useCatalog();
  const latest = useResource('/assessments/latest');
  const setId = latest.data?.guidelineSetId;
  const vaccines = (setId && catalog?.vaccinesBySet?.[setId]) || [];
  const preset = params.get('vaccine');

  if (!catalog || latest.loading) return <DataState kind="loading" title="Loading…" />;
  if (!vaccines.length)
    return (
      <DataState kind="unavailable" title="Recording isn’t available for your location yet">
        We can only record vaccines covered by the guideline for your country.
      </DataState>
    );

  return (
    <>
      <PageHeader
        back={{ to: '/history', label: 'History' }}
        title="Record a vaccination"
        lede="Add a vaccination you’ve received. We’ll update your schedule and show what to expect next."
      />
      <div className="max-w-2xl">
        {preset ? (
          <DoseForm
            fixedVaccine={preset}
            products={catalog.products}
            showProvider
            submitLabel="Record vaccination"
            onSaved={(res) => navigate(`/record/${res.record.id}/aftercare`)}
          />
        ) : (
          <DoseForm
            vaccines={vaccines}
            products={catalog.products}
            showProvider
            submitLabel="Record vaccination"
            onSaved={(res) => navigate(`/record/${res.record.id}/aftercare`)}
          />
        )}
        {preset && (
          <p className="mt-3 text-sm text-ink-2">
            Recording: <strong>{vaccines.find((v) => v.id === preset)?.name ?? preset}</strong>.{' '}
            <Link to="/record">Choose a different vaccine</Link>
          </p>
        )}
      </div>
    </>
  );
}

export function AftercarePage() {
  const { recordId } = useParams();
  const rec = useResource(`/intake/records/${recordId}`);
  const latest = useResource('/assessments/latest');
  const setId = latest.data?.guidelineSetId;
  const vid = rec.data?.record?.vaccine_id;
  const detail = useResource(setId && vid ? `/guidelines/${setId}/vaccines/${vid}` : null);

  if (rec.loading || latest.loading || detail.loading) return <DataState kind="loading" title="Loading…" />;
  if (rec.error) return <DataState kind="error" title="We couldn’t find this record">{rec.error.message}</DataState>;

  const r = rec.data.record;
  const vaccine = detail.data?.vaccine;
  const result = latest.data?.result?.results?.find((x) => x.vaccineId === vid);
  const c = vaccine?.content;

  return (
    <>
      <PageHeader title="Vaccination recorded" back={{ to: '/history', label: 'History' }}>
        <p className="inline-flex items-center gap-2 text-ok">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          Saved to your history. Your schedule has been updated.
        </p>
      </PageHeader>

      <dl className="mb-10 grid max-w-2xl gap-x-6 gap-y-2 border-y border-rule py-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <dt className="text-ink-3">Vaccine</dt>
        <dd>{vaccine?.name ?? vid}</dd>
        <dt className="text-ink-3">Date</dt>
        <dd>{r.date ? formatDate(r.date, r.date_precision) : 'Not known'}</dd>
        <dt className="text-ink-3">Dose number</dt>
        <dd>{r.dose_number ?? 'Not given'}</dd>
        <dt className="text-ink-3">Where</dt>
        <dd>{r.provider_text || 'Not given'}</dd>
      </dl>

      {c ? (
        <div className="prose-measure space-y-8">
          <section className="space-y-3">
            <h2 className="text-2xl">What you may notice</h2>
            <p>These are common and usually mild:</p>
            <ul className="list-disc space-y-1 pl-5">
              {c.common_reactions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            {c.reactions_duration && <p className="text-ink-2">{c.reactions_duration}</p>}
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl">Looking after yourself</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>If you feel dizzy or faint, sit or lie down and tell someone nearby.</li>
              <li>Contact a healthcare professional if a reaction worries you or doesn’t improve after a few days.</li>
              <li>If you had a reaction, record it in your safety answers so future assessments take it into account.</li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl">Rare but serious reactions</h2>
            <ul className="list-disc space-y-1 pl-5">
              {c.serious_reactions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <EmergencyHelp guideline={detail.data.guideline} />
          {result?.timing && (
            <section className="space-y-3">
              <h2 className="text-2xl">What’s next</h2>
              <p className="font-medium">{timingSummary(result.timing)}</p>
              <DoseTimeline timing={result.timing} />
              <p className="text-sm text-ink-2">
                We’ve added this to your <Link to="/schedule">schedule and reminders</Link>.
              </p>
            </section>
          )}
          <section className="space-y-2 border-t border-rule pt-6">
            <h2 className="text-lg">Sources</h2>
            <SourceList sources={detail.data.sources.filter((s) => c.sources.includes(s.id))} />
          </section>
        </div>
      ) : (
        <DataState kind="unavailable" title="After-care information isn’t available for this vaccine" />
      )}
      <div className="mt-10 flex flex-wrap gap-2">
        <Button to="/home">Go to home</Button>
        <Button to="/record" variant="secondary">
          Record another
        </Button>
      </div>
    </>
  );
}
