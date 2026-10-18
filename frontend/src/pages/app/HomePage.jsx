import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import DoseTimeline from '../../components/ui/DoseTimeline';
import Notice from '../../components/ui/Notice';
import { ProvenanceLine } from '../../components/ui/Provenance';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, formatDateTime, relativeDay } from '../../lib/format';
import { ACTIONABLE, nextAction, timingSummary } from '../../lib/results';
import { useResource } from '../../lib/useResource';
import { RunOutcome } from './RecommendationsPage';

const ACTION_COPY = {
  due: { eyebrow: 'Next step', cta: 'Find providers' },
  review: { eyebrow: 'Talk to a professional', cta: 'See why' },
  info: { eyebrow: 'We need more information', cta: 'See what’s missing' },
  upcoming: { eyebrow: 'Coming up', cta: 'See the schedule' },
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function HomePage() {
  const latest = useResource('/assessments/latest');
  const intake = useResource('/intake');
  const reminders = useResource('/reminders');
  const activity = useResource('/activity');

  if (latest.loading || intake.loading) return <DataState kind="loading" title="Loading…" />;
  if (latest.error) return <DataState kind="error" title="We couldn’t load your overview">{latest.error.message}</DataState>;

  const run = latest.data;
  const name = intake.data?.profile?.full_name?.split(' ')[0];
  const action = run ? nextAction(run.result) : null;
  const results = run?.result?.results ?? [];
  const inProgress = results.find((r) => ACTIONABLE.has(r.status) && r.timing?.dosesRequired > 1 && r.timing?.dosesCounted > 0);
  const safety = results.filter((r) => r.status === 'CONTRAINDICATION');
  const recommended = results.filter((r) => ACTIONABLE.has(r.status));
  // Vaccines that are due now are already listed under "Current recommendations";
  // "Coming up" only carries what that list doesn't.
  const dueNow = new Set(recommended.filter((r) => r.timing?.dueNow).map((r) => r.vaccineId));
  const upcoming = (reminders.data ?? [])
    .filter((r) => r.status === 'open' && r.dueDate && !dueNow.has(r.vaccineId))
    .slice(0, 3);
  const recent = (activity.data ?? []).filter((e) => ['vaccination_record', 'assessment'].includes(e.entity)).slice(0, 3);

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="text-ink-2">
          {greeting()}
          {name ? `, ${name}` : ''}.
        </p>
        <h1 className="text-display">What you need to know today</h1>
        {run && <ProvenanceLine guideline={run.result.guidelineSet} />}
      </header>

      {!run && (
        <DataState kind="empty" title="Run your first assessment" action={<Button to="/start/review">Review and run</Button>}>
          Check your information and see which vaccinations may be relevant to you.
        </DataState>
      )}
      {run && run.outcome !== 'COMPLETE' && <RunOutcome run={run} />}

      {action && (
        <section aria-labelledby="next-action" className="grid gap-6 rounded-lg bg-sky p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="min-w-0 space-y-3">
            <p className="text-sm font-semibold text-accent">{ACTION_COPY[action.kind].eyebrow}</p>
            <h2 id="next-action" className="text-3xl">
              {action.result.name}
            </h2>
            <StatusBadge status={action.result.status} />
            <p className="prose-measure text-lg text-ink-2">{action.result.headline}</p>
            {timingSummary(action.result.timing) && <p className="font-medium">{timingSummary(action.result.timing)}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {action.kind === 'due' && <Button to={`/providers?vaccine=${action.result.vaccineId}`}>{ACTION_COPY.due.cta}</Button>}
            {action.kind === 'upcoming' && <Button to="/schedule">{ACTION_COPY.upcoming.cta}</Button>}
            <Button to={`/vaccines/${action.result.vaccineId}`} variant={action.kind === 'due' || action.kind === 'upcoming' ? 'secondary' : 'primary'}>
              {action.kind === 'due' || action.kind === 'upcoming' ? 'View details' : ACTION_COPY[action.kind].cta}
            </Button>
          </div>
        </section>
      )}

      {run?.outcome === 'COMPLETE' && !action && (
        <Notice tone="ok" title="Nothing needs doing right now">
          Based on your answers, you’re up to date with the vaccinations we assess.
        </Notice>
      )}

      {safety.length > 0 && (
        <Notice tone="stop" title="Important safety notice">
          Your answers match a reason not to have {safety.map((r) => r.shortName).join(', ')} right now. Please speak to a
          healthcare professional before these vaccines. <Link to="/recommendations">See details</Link>
        </Notice>
      )}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-12">
          {inProgress && (
            <section aria-labelledby="timeline" className="space-y-4">
              <h2 id="timeline" className="text-2xl">
                Your {inProgress.shortName} doses
              </h2>
              <DoseTimeline timing={inProgress.timing} />
              <Link to={`/vaccines/${inProgress.vaccineId}/schedule`} className="inline-flex items-center gap-1 text-sm">
                Schedule details <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
          )}

          {recommended.length > 0 && (
            <section aria-labelledby="current" className="space-y-3">
              <h2 id="current" className="text-2xl">
                Current recommendations
              </h2>
              <ul className="divide-y divide-rule border-y border-rule">
                {recommended.map((r) => (
                  <li key={r.vaccineId}>
                    <Link
                      to={`/vaccines/${r.vaccineId}`}
                      className="flex min-h-14 items-center justify-between gap-4 py-3 text-ink no-underline hover:bg-paper-2"
                    >
                      <span className="font-medium">{r.shortName}</span>
                      <span className="text-right text-sm text-ink-2">{timingSummary(r.timing) ?? ''}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/recommendations" className="inline-flex items-center gap-1 text-sm">
                All results and reasons <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
          )}
        </div>

        <aside className="space-y-10">
          <section aria-labelledby="reminders" className="space-y-3">
            <h2 id="reminders" className="text-xl">
              Coming up
            </h2>
            {upcoming.length ? (
              <ul className="space-y-3">
                {upcoming.map((r) => (
                  <li key={r.id}>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm text-ink-2">
                      <span className="data">{formatDate(r.dueDate)}</span> · {relativeDay(r.dueDate)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-2">Nothing else is scheduled. Anything due now is listed under current recommendations.</p>
            )}
            <Link to="/schedule" className="text-sm">
              Schedule and reminders
            </Link>
          </section>

          <section aria-labelledby="recent" className="space-y-3">
            <h2 id="recent" className="text-xl">
              Recent activity
            </h2>
            {recent.length ? (
              <ul className="space-y-2 text-sm">
                {recent.map((e) => (
                  <li key={e.id} className="flex justify-between gap-3">
                    <span>{e.entity === 'assessment' ? 'Assessment updated' : `Vaccination ${e.action}`}</span>
                    <span className="data text-ink-3">{formatDateTime(e.at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-2">Nothing yet.</p>
            )}
          </section>

          <section aria-labelledby="need" className="space-y-2">
            <h2 id="need" className="text-xl">
              Other things you can do
            </h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/record">Record a vaccination</Link>
              </li>
              <li>
                <Link to="/providers">Find providers</Link>
              </li>
              <li>
                <Link to="/history">View history</Link>
              </li>
              <li>
                <Link to="/profile">Update your information</Link>
              </li>
              <li>
                <Link to="/notifications">Vaccine update alerts</Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

