import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import Disclosure from '../../components/ui/Disclosure';
import Notice from '../../components/ui/Notice';
import PageHeader from '../../components/ui/PageHeader';
import { ProvenanceLine } from '../../components/ui/Provenance';
import RecommendationRow from '../../features/results/RecommendationRow';
import AlertPermission from '../../features/results/AlertPermission';
import { StatusStrip } from '../../features/results/ResultMoment';
import { api } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { GROUPS, resultHeadline } from '../../lib/results';
import { useResource } from '../../lib/useResource';

const OUTCOME_COPY = {
  NO_GUIDELINE: { tone: 'info', title: 'We don’t have guidelines for your country yet' },
  POPULATION_NOT_COVERED: { tone: 'info', title: 'The guideline for your country doesn’t cover your group' },
  INSUFFICIENT_INFORMATION: { tone: 'caution', title: 'We need a little more information' },
};

export function RunOutcome({ run }) {
  const copy = OUTCOME_COPY[run.outcome];
  if (!copy) return null;
  return (
    <div className="space-y-4">
      <Notice tone={copy.tone} title={copy.title}>
        <p>{run.result.message}</p>
        {run.result.missing?.length > 0 && (
          <ul className="list-disc pl-5">
            {run.result.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </Notice>
      <div className="flex flex-wrap gap-2">
        <Button to="/start/review" variant="secondary">
          Review your information
        </Button>
        <Button to="/about/sources" variant="quiet">
          Which guidelines we cover
        </Button>
      </div>
    </div>
  );
}

/**
 * The result moment: the outcome in one sentence, every vaccine checked as a
 * mark in one strip, then the single next action. The detail follows below.
 */
function ResultHeader({ groups, run, actions }) {
  const headline = resultHeadline(groups);
  const rest = groups.filter((g) => g.group.status !== headline.status);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <header className="mb-16 space-y-8 rounded-lg bg-sky p-6 sm:p-10">
      <div className="space-y-4">
        <p className="text-sm text-ink-2">
          Your result · we checked <span className="data font-semibold text-ink">{total}</span> vaccines against your answers
        </p>
        <h1 className="text-display max-w-3xl">{headline.text}</h1>
        {rest.length > 0 && (
          <p className="prose-measure text-lg text-ink-2">
            Also: {rest.map((g) => `${g.items.length} ${g.group.inline}`).join(', ')}.
            Each result explains why it appeared.
          </p>
        )}
      </div>
      <StatusStrip groups={groups} />
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      <ProvenanceLine guideline={run.result.guidelineSet} />
    </header>
  );
}

export default function RecommendationsPage() {
  const [params] = useSearchParams();
  const runId = params.get('run');
  const { data: run, error, loading, reload } = useResource(runId ? `/assessments/${runId}` : '/assessments/latest');
  const [rerunning, setRerunning] = useState(false);
  const [rerunError, setRerunError] = useState(null);

  const rerun = async () => {
    setRerunning(true);
    setRerunError(null);
    try {
      await api.post('/assessments');
      reload();
    } catch (err) {
      setRerunError(err.message);
    } finally {
      setRerunning(false);
    }
  };

  if (loading && !run) return <DataState kind="loading" title="Loading your results…" />;
  if (error)
    return (
      <DataState kind="error" title="We couldn’t load your results" action={<Button variant="secondary" onClick={reload}>Try again</Button>}>
        {error.message}
      </DataState>
    );
  if (!run)
    return (
      <DataState kind="empty" title="You haven’t run an assessment yet" action={<Button to="/start/review">Review and run</Button>}>
        Review your information to see which vaccinations may be relevant to you.
      </DataState>
    );

  const result = run.result;
  const groups = GROUPS.map((group) => ({ group, items: (result.results ?? []).filter((r) => r.status === group.status) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <>
      {run.outcome === 'COMPLETE' ? (
        <ResultHeader
          groups={groups}
          run={run}
          actions={
            !runId && (
              <>
                <Button to="/providers" size="lg">
                  Find providers
                </Button>
                <Button to="/start/review" variant="secondary" size="lg">
                  Update my answers
                </Button>
                <Button variant="quiet" onClick={rerun} loading={rerunning} loadingLabel="Re-checking…">
                  Re-check now
                </Button>
              </>
            )
          }
        />
      ) : (
        <PageHeader title="Your vaccination results" lede="Here’s what we could work out from your answers.">
          <ProvenanceLine guideline={result.guidelineSet} />
        </PageHeader>
      )}
      {runId && (
        <Notice tone="info" className="mb-8">
          You’re viewing a past assessment from {formatDateTime(run.createdAt)}. <Link to="/recommendations">See your latest</Link>.
        </Notice>
      )}
      {rerunError && <Notice tone="error" className="mb-8">{rerunError}</Notice>}

      {run.outcome !== 'COMPLETE' ? (
        <RunOutcome run={run} />
      ) : (
        <>
          <div className="space-y-14">
            {groups.map(({ group: g, items }) => {
              const body = items.map((r) => <RecommendationRow key={r.vaccineId} result={r} />);
              return (
                <section key={g.status} id={`group-${g.status}`} aria-labelledby={`group-${g.status}-title`} className="scroll-mt-6">
                  <div className="mb-2 space-y-1 border-t-2 border-ink pt-4">
                    <h2 id={`group-${g.status}-title`} className="text-2xl">
                      {g.title} <span className="data text-base font-normal text-ink-3">({items.length})</span>
                    </h2>
                    <p className="prose-measure text-ink-2">{g.lede}</p>
                  </div>
                  {g.status === 'NOT_INDICATED' ? (
                    <Disclosure summary={`Show ${items.length} vaccine${items.length > 1 ? 's' : ''}`}>{body}</Disclosure>
                  ) : (
                    body
                  )}
                </section>
              );
            })}
          </div>
          {!runId && <AlertPermission />}
        </>
      )}

      <footer className="mt-12 border-t border-rule pt-6 text-sm text-ink-3">
        <p>
          Assessed {formatDateTime(run.createdAt)} · engine <span className="code">{run.engineVersion}</span>. Results come
          from fixed rules applied to the guideline, not from AI. They support, but don’t replace, advice from a healthcare
          professional.
        </p>
      </footer>
    </>
  );
}
