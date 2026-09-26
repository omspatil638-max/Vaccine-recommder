import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import DoseTimeline from '../../components/ui/DoseTimeline';
import Notice from '../../components/ui/Notice';
import PageHeader from '../../components/ui/PageHeader';
import { ProvenanceLine, SourceList } from '../../components/ui/Provenance';
import StatusBadge from '../../components/ui/StatusBadge';
import { WhyThis } from '../../features/results/RecommendationRow';
import { ACTIONABLE, SAFETY_KIND, timingSummary } from '../../lib/results';
import { useResource } from '../../lib/useResource';
import { formatDate, lcFirst } from '../../lib/format';

function tabClass({ isActive }) {
  return `inline-flex min-h-11 items-center border-b-2 px-3 text-sm no-underline ${
    isActive ? 'border-accent font-semibold text-ink' : 'border-transparent text-ink-2 hover:text-ink'
  }`;
}

function DocSection({ title, children }) {
  return (
    <section className="prose-measure space-y-3 border-t border-rule pt-8">
      <h2 className="text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export function VaccineLayout() {
  const { vaccineId } = useParams();
  const latest = useResource('/assessments/latest');
  const setId = latest.data?.guidelineSetId;
  const detail = useResource(setId ? `/guidelines/${setId}/vaccines/${vaccineId}` : null);

  if (latest.loading || (setId && detail.loading)) return <DataState kind="loading" title="Loading vaccine information…" />;
  if (!setId)
    return (
      <DataState kind="unavailable" title="Vaccine details aren’t available for your location" action={<Button to="/recommendations" variant="secondary">Back to your results</Button>}>
        We show vaccine details from the guideline for your country, and we don’t have one for your location yet.
      </DataState>
    );
  if (detail.error)
    return (
      <DataState kind="unavailable" title="We don’t have information about this vaccine" action={<Button to="/recommendations" variant="secondary">Back to your results</Button>}>
        {detail.error.message}
      </DataState>
    );

  const { vaccine, guideline, sources } = detail.data;
  const result = latest.data.result.results?.find((r) => r.vaccineId === vaccineId) ?? null;

  return (
    <>
      <PageHeader
        back={{ to: '/recommendations', label: 'Your vaccinations' }}
        title={vaccine.name}
        lede={`Protects against ${lcFirst(vaccine.protectsAgainst)}.`}
      />
      <nav aria-label="Vaccine sections" className="-mt-2 mb-8 border-b border-rule">
        <ul className="flex gap-1 overflow-x-auto">
          <li>
            <NavLink end to={`/vaccines/${vaccineId}`} className={tabClass}>
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink to={`/vaccines/${vaccineId}/safety`} className={tabClass}>
              Safety
            </NavLink>
          </li>
          <li>
            <NavLink to={`/vaccines/${vaccineId}/schedule`} className={tabClass}>
              Schedule
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
        <div className="min-w-0">
          <Outlet context={{ vaccine, guideline, sources, result }} />
        </div>
        <AtAGlance vaccine={vaccine} guideline={guideline} result={result} />
      </div>
    </>
  );
}

/**
 * The margin column of a vaccine page: the reader's own status, timing and
 * next actions stay beside the document on every tab. On small screens it
 * comes first, so the answer is read before the reference material.
 */
function AtAGlance({ vaccine, guideline, result }) {
  const timing = timingSummary(result?.timing);
  return (
    <aside aria-labelledby="glance" className="order-first lg:order-none">
      <div className="space-y-4 rounded-lg bg-sky p-5 lg:sticky lg:top-8">
        <h2 id="glance" className="font-body text-sm font-semibold text-ink-2">
          At a glance
        </h2>
        {result ? (
          <StatusBadge status={result.status} />
        ) : (
          <p className="text-sm text-ink-2">Not part of your latest assessment.</p>
        )}
        <dl className="space-y-3 text-sm">
          {timing && (
            <div>
              <dt className="text-ink-3">Timing</dt>
              <dd className="font-medium text-ink">{timing}</dd>
            </div>
          )}
          <div>
            <dt className="text-ink-3">Type</dt>
            <dd className="text-ink">{vaccine.live ? 'Live vaccine' : 'Not a live vaccine'}</dd>
          </div>
          {guideline && (
            <div>
              <dt className="text-ink-3">Guideline last checked</dt>
              <dd className="data text-ink">{formatDate(guideline.last_verified)}</dd>
            </div>
          )}
        </dl>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
          {result && ACTIONABLE.has(result.status) && <Button to={`/providers?vaccine=${vaccine.id}`}>Find providers</Button>}
          <Button to={`/record?vaccine=${vaccine.id}`} variant="secondary">
            I’ve had a dose
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function VaccineOverview() {
  const { vaccine, guideline, sources, result } = useOutletContext();
  const c = vaccine.content;

  return (
    <div className="space-y-8">
      {result && (
        <section aria-labelledby="your-result" className="prose-measure space-y-3">
          <h2 id="your-result" className="text-xl">
            Your result
          </h2>
          <p className="text-lg">{result.headline}</p>
          <WhyThis result={result} />
        </section>
      )}

      <DocSection title="What it protects against">
        <p>{c.disease}</p>
      </DocSection>
      <DocSection title="Why it may be useful">
        <p>{c.why}</p>
        {result?.reasons?.length > 0 && (
          <p className="text-ink-2">For you: {result.reasons[0].text}</p>
        )}
      </DocSection>
      <DocSection title="Who it’s intended for">
        <p>{c.who}</p>
      </DocSection>
      <DocSection title="Doses">
        <p>{c.doses_text}</p>
        {c.catch_up && <p className="text-ink-2">{c.catch_up}</p>}
        <p>
          <Link to={`/vaccines/${vaccine.id}/schedule`}>See the dose schedule and your dates</Link>
        </p>
      </DocSection>
      <DocSection title="Sources">
        <SourceList sources={sources} />
        <ProvenanceLine guideline={guideline} />
        <p className="text-sm text-ink-3">We don’t quote effectiveness figures unless a cited source provides them.</p>
      </DocSection>
    </div>
  );
}

export function EmergencyHelp({ guideline }) {
  const us = guideline?.jurisdiction === 'US';
  return (
    <Notice tone="stop" title="When urgent help is needed">
      <p>
        Signs of a severe allergic reaction include hives, swelling of the face and throat, difficulty breathing, a fast
        heartbeat, dizziness or weakness. {us ? 'Call 9-1-1' : 'Call your local emergency number'} and get the person to the
        nearest hospital.
      </p>
      <p className="text-ink-2">These usually happen within minutes to an hour, but can happen after you leave the clinic.</p>
    </Notice>
  );
}

function RuleList({ items, empty, applies }) {
  if (!items.length) return <p className="text-ink-2">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((r) => {
        const mine = applies.get(r.id);
        return (
            <li key={r.id} className="space-y-1">
              <p>{r.text}</p>
              {mine && (
                <p className={`text-sm font-semibold ${SAFETY_KIND[mine.kind].tone === 'stop' ? 'text-stop' : 'text-caution'}`}>
                  {mine.kind === 'unresolved' ? 'Your answers didn’t rule this out' : 'This matches your answers'}
                </p>
              )}
            </li>
        );
      })}
    </ul>
  );
}

export function VaccineSafety() {
  const { vaccine, guideline, sources, result } = useOutletContext();
  const c = vaccine.content;
  const applies = new Map((result?.safety ?? []).map((s) => [s.ruleId, s]));
  const us = guideline?.jurisdiction === 'US';

  return (
    <div className="space-y-8">
      <Notice tone="info" title="Something happening after a vaccine isn’t proof the vaccine caused it">
        Health problems can happen by coincidence around the time of vaccination. A healthcare professional can help work out
        the cause. {us && 'In the US, anyone can report a possible reaction to VAERS (vaers.hhs.gov).'}
      </Notice>

      <DocSection title="Common, expected reactions">
        <ul className="list-disc space-y-1 pl-5">
          {c.common_reactions.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        {c.reactions_duration && <p className="text-ink-2">{c.reactions_duration}</p>}
      </DocSection>

      <DocSection title="Rare or serious reactions">
        <ul className="list-disc space-y-1 pl-5">
          {c.serious_reactions.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </DocSection>

      <DocSection title="Reasons not to have it (contraindications)">
        <RuleList
          applies={applies}
          items={vaccine.contraindications.filter((r) => r.kind !== 'defer')}
          empty="The source we use doesn’t list contraindications for this vaccine. Tell the person vaccinating you about any severe allergy or past reaction."
        />
      </DocSection>

      {vaccine.contraindications.some((r) => r.kind === 'defer') && (
        <DocSection title="Reasons to wait">
          <RuleList applies={applies} items={vaccine.contraindications.filter((r) => r.kind === 'defer')} />
        </DocSection>
      )}

      <DocSection title="Reasons to check with a professional first (precautions)">
        <RuleList applies={applies} items={vaccine.precautions} empty={vaccine.safetyNote ?? 'None listed in our source.'} />
      </DocSection>

      <DocSection title="When to contact a healthcare professional">
        <ul className="list-disc space-y-1 pl-5">
          <li>If you’re worried about any reaction, or it doesn’t improve after a few days.</li>
          <li>If you feel dizzy, have changes in vision or ringing in the ears around the time of the vaccination, tell the person vaccinating you; people sometimes faint after medical procedures.</li>
        </ul>
      </DocSection>

      <EmergencyHelp guideline={guideline} />

      <DocSection title="Sources">
        <SourceList sources={sources} />
      </DocSection>
    </div>
  );
}

function days(n) {
  if (n == null) return '—';
  if (n % 30 === 0 && n >= 60) return `${n / 30} months`;
  if (n % 7 === 0) return `${n / 7} weeks`;
  return `${n} days`;
}

export function VaccineSchedule() {
  const { vaccine, guideline, sources, result } = useOutletContext();
  const series = vaccine.series;
  const timing = result?.timing;
  const summary = timingSummary(timing);
  const showTable = series.kind === 'series' || series.kind === 'pregnancy_td';

  return (
    <div className="space-y-8">
      <section className="prose-measure space-y-4">
        <h2 className="text-xl">Can I have it now?</h2>
        {!result || !timing ? (
          <p className="text-ink-2">
            {result?.status === 'NOT_INDICATED'
              ? 'It isn’t currently indicated for you, so there’s no schedule to show.'
              : 'We can’t work out your timing yet. Add your previous doses, or check with a professional.'}
          </p>
        ) : (
          <>
            <p className="text-lg font-medium">{summary}</p>
            {result.status === 'CONTRAINDICATION' && (
              <Notice tone="stop">Your answers match a reason not to have this vaccine right now. Please speak to a professional.</Notice>
            )}
            {result.status === 'REVIEW_WITH_PROFESSIONAL' && (
              <Notice tone="caution">Check with a healthcare professional before your next dose.</Notice>
            )}
            <DoseTimeline timing={timing} />
            {timing.notes?.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
                {timing.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <DocSection title="The schedule">
        <p>{vaccine.content.doses_text}</p>
        {series.kind === 'seasonal' && <p className="text-ink-2">One dose each flu season.</p>}
        {series.kind === 'booster' && (
          <p className="text-ink-2">A booster is due every {Math.round(series.booster_every_days / 365)} years after the last dose.</p>
        )}
        {showTable && (
          <>
            <table className="hidden w-full text-left text-sm sm:table">
              <caption className="visually-hidden">Doses and intervals</caption>
              <thead>
                <tr className="border-b border-rule-strong text-ink-2">
                  <th scope="col" className="py-2 pr-4 font-semibold">Dose</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Minimum wait</th>
                  <th scope="col" className="py-2 font-semibold">Usual timing</th>
                </tr>
              </thead>
              <tbody>
                {series.doses.map((d) => (
                  <tr key={d.n} className="border-b border-rule">
                    <th scope="row" className="py-2 pr-4 font-normal">
                      Dose {d.n}
                    </th>
                    <td className="data py-2 pr-4">
                      {d.n === 1
                        ? '—'
                        : `${days(d.min_after_prev_days)} after dose ${d.n - 1}${d.min_after_first_days ? `, and ${days(d.min_after_first_days)} after dose 1` : ''}`}
                    </td>
                    <td className="data py-2">
                      {d.n === 1
                        ? 'When recommended'
                        : d.rec_after_first_days
                          ? `${days(d.rec_after_first_days)} after dose 1`
                          : `${days(d.rec_after_prev_days)}${d.rec_latest_after_prev_days ? ` to ${days(d.rec_latest_after_prev_days)}` : ''} after dose ${d.n - 1}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="space-y-3 text-sm sm:hidden">
              {series.doses.map((d) => (
                <div key={d.n} className="border-b border-rule pb-2">
                  <dt className="font-semibold">Dose {d.n}</dt>
                  <dd className="text-ink-2">
                    {d.n === 1 ? 'When recommended' : `At least ${days(d.min_after_prev_days)} after dose ${d.n - 1}`}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {series.note && <p className="text-ink-2">{series.note}</p>}
      </DocSection>

      <DocSection title="Where the timing comes from">
        <p className="text-ink-2">
          Dates are calculated from the minimum and usual intervals in the guideline and the dates you’ve recorded. A dose given
          too early isn’t counted.
        </p>
        <SourceList sources={sources.filter((s) => vaccine.indications.some((r) => r.source === s.id))} />
        <ProvenanceLine guideline={guideline} />
      </DocSection>
    </div>
  );
}

