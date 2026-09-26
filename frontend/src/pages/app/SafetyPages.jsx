import { Link } from 'react-router';
import { Printer } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import Notice from '../../components/ui/Notice';
import PageHeader from '../../components/ui/PageHeader';
import { ProvenanceLine } from '../../components/ui/Provenance';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateTime } from '../../lib/format';
import { SAFETY_KIND } from '../../lib/results';
import { useCatalog, useResource } from '../../lib/useResource';
import { EmergencyHelp } from './VaccinePages';

const TRI = { yes: 'Yes', no: 'No', unsure: 'Not sure' };
const SEVERITY = { anaphylaxis: 'severe', non_severe: 'not severe', unknown: 'severity not known' };

// Order safety flags from most to least restrictive.
const KIND_ORDER = ['contraindication', 'defer', 'precaution', 'unresolved'];
const KIND_TITLE = {
  contraindication: 'Not recommended for you right now',
  defer: 'Wait for now',
  precaution: 'Check with a professional first',
  unresolved: 'Couldn’t be ruled out from your answers',
};

function useLatest() {
  const latest = useResource('/assessments/latest');
  const intake = useResource('/intake');
  const { catalog } = useCatalog();
  return { latest, intake, catalog };
}

/** Every safety flag from the latest assessment, plus the answers they came from. */
export function SafetyPage() {
  const { latest, intake, catalog } = useLatest();

  if (latest.loading || intake.loading || !catalog) return <DataState kind="loading" title="Loading your safety summary…" />;
  if (latest.error || intake.error)
    return <DataState kind="error" title="We couldn’t load your safety summary">{(latest.error ?? intake.error).message}</DataState>;

  const run = latest.data;
  const s = intake.data?.safety;
  const results = run?.result?.results ?? [];
  const flags = results.flatMap((r) => (r.safety ?? []).map((f) => ({ ...f, vaccine: r })));
  const substance = Object.fromEntries(catalog.allergySubstances.map((c) => [c.code, c.label]));
  const reaction = Object.fromEntries(catalog.reactionKinds.map((c) => [c.code, c.label]));
  const question = Object.fromEntries(catalog.safetyQuestions.map((q) => [q.code, q.label]));
  const vaccineName = Object.fromEntries(results.map((r) => [r.vaccineId, r.shortName]));
  const flagged = s ? Object.entries(s.answers).filter(([, v]) => v !== 'no') : [];

  return (
    <>
      <PageHeader
        title="Safety"
        lede="What your answers mean for each vaccine, checked one vaccine at a time against the guideline’s list of reasons to wait or get advice."
        actions={
          <Button to="/start/safety?return=profile" variant="secondary">
            Update safety answers
          </Button>
        }
      >
        {run && <ProvenanceLine guideline={run.result.guidelineSet} />}
      </PageHeader>

      <div className="space-y-12">
        <section aria-labelledby="flags" className="space-y-4">
          <h2 id="flags" className="text-2xl">
            Safety flags from your latest assessment
          </h2>
          {!run ? (
            <DataState kind="empty" title="No assessment yet" action={<Button to="/start/review">Review and run</Button>}>
              Run an assessment to see what your answers mean for each vaccine.
            </DataState>
          ) : flags.length === 0 ? (
            <Notice tone="ok" title="No safety flags">
              None of your answers matched a reason to wait or to get advice first for the vaccines we assess.
            </Notice>
          ) : (
            KIND_ORDER.filter((k) => flags.some((f) => f.kind === k)).map((k) => (
              <div key={k} className="space-y-2">
                <h3 className={`text-lg ${SAFETY_KIND[k].tone === 'stop' ? 'text-stop' : 'text-caution'}`}>{KIND_TITLE[k]}</h3>
                <ul className="divide-y divide-rule border-y border-rule">
                  {flags
                    .filter((f) => f.kind === k)
                    .map((f) => (
                      <li key={`${f.vaccine.vaccineId}-${f.ruleId}`} className="grid gap-1 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6">
                        <Link to={`/vaccines/${f.vaccine.vaccineId}/safety`} className="font-medium">
                          {f.vaccine.shortName}
                        </Link>
                        <p>{f.text}</p>
                      </li>
                    ))}
                </ul>
              </div>
            ))
          )}
        </section>

        {s && (
          <section aria-labelledby="answers" className="space-y-4">
            <h2 id="answers" className="text-2xl">
              What you told us
            </h2>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <dt className="text-sm text-ink-3">Allergies</dt>
              <dd>
                {s.allergy_triage === 'yes'
                  ? s.allergies
                      .map((a) => `${a.substance === 'other' ? a.substance_other || 'Other' : substance[a.substance]} (${SEVERITY[a.severity]})`)
                      .join('; ')
                  : TRI[s.allergy_triage]}
              </dd>
              <dt className="text-sm text-ink-3">Past reactions to vaccines</dt>
              <dd>
                {s.reaction_triage === 'yes'
                  ? s.reactions
                      .map((r) => `${reaction[r.kind]} after ${r.vaccine_id === 'unknown' ? 'an unknown vaccine' : vaccineName[r.vaccine_id] ?? r.vaccine_id}`)
                      .join('; ')
                  : TRI[s.reaction_triage]}
              </dd>
              <dt className="text-sm text-ink-3">Other safety questions</dt>
              <dd>
                {flagged.length ? (
                  <ul className="space-y-1">
                    {flagged.map(([code, v]) => (
                      <li key={code}>
                        <span className="font-medium">{TRI[v]}:</span> {question[code] ?? code}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'You answered “No” to all of them.'
                )}
              </dd>
            </dl>
          </section>
        )}

        <EmergencyHelp guideline={run?.result?.guidelineSet} />
      </div>
    </>
  );
}

const REVIEW_STATUSES = ['CONTRAINDICATION', 'REVIEW_WITH_PROFESSIONAL', 'INSUFFICIENT_INFORMATION', 'MAY_BE_APPROPRIATE'];

/**
 * A summary to take to a healthcare professional. Nothing here has been
 * reviewed by a clinician, and the page says so.
 */
export function ClinicalReviewPage() {
  const { latest } = useLatest();

  if (latest.loading) return <DataState kind="loading" title="Loading…" />;
  if (latest.error) return <DataState kind="error" title="We couldn’t load your results">{latest.error.message}</DataState>;

  const run = latest.data;
  const items = (run?.result?.results ?? [])
    .filter((r) => REVIEW_STATUSES.includes(r.status) || (r.safety ?? []).some((f) => f.kind === 'unresolved'))
    .sort((a, b) => REVIEW_STATUSES.indexOf(a.status) - REVIEW_STATUSES.indexOf(b.status));

  return (
    <>
      <PageHeader
        title="Clinical review"
        lede="The results a healthcare professional should look at with you, and the questions to ask. Print it or show it at your appointment."
        actions={
          run &&
          items.length > 0 && (
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden="true" /> Print summary
            </Button>
          )
        }
      >
        <Notice tone="info" title="Not yet reviewed by a clinician">
          These results come from fixed rules applied to the guideline. No healthcare professional has reviewed them in this
          service.
        </Notice>
      </PageHeader>

      {!run ? (
        <DataState kind="empty" title="No assessment yet" action={<Button to="/start/review">Review and run</Button>}>
          Run an assessment first.
        </DataState>
      ) : items.length === 0 ? (
        <Notice tone="ok" title="Nothing needs a professional’s review">
          None of your results need advice before vaccination. You can still discuss any of them with a professional.
        </Notice>
      ) : (
        <ol className="divide-y divide-rule border-y border-rule">
          {items.map((r) => (
            <li key={r.vaccineId} className="space-y-3 py-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-xl">
                  <Link to={`/vaccines/${r.vaccineId}`} className="text-ink no-underline hover:underline">
                    {r.name}
                  </Link>
                </h2>
                <StatusBadge status={r.status} className="self-start" />
              </div>
              <p className="prose-measure">{r.headline}</p>
              {(r.safety ?? []).length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {r.safety.map((f) => (
                    <li key={f.ruleId}>
                      <span className="font-semibold">{SAFETY_KIND[f.kind].label}:</span> {f.text}
                    </li>
                  ))}
                </ul>
              )}
              {(r.missing ?? []).length > 0 && (
                <div className="text-sm">
                  <p className="text-ink-2">Bring or ask about:</p>
                  <ul className="list-disc pl-5">
                    {r.missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {run && (
        <div className="mt-8 space-y-1 text-sm text-ink-3">
          <p>Assessed {formatDateTime(run.createdAt)}.</p>
          <ProvenanceLine guideline={run.result.guidelineSet} />
        </div>
      )}
    </>
  );
}
