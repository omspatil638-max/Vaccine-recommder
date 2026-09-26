import { Link } from 'react-router';
import { ArrowRight, Check, CircleHelp, ExternalLink } from 'lucide-react';
import Disclosure from '../../components/ui/Disclosure';
import StatusBadge from '../../components/ui/StatusBadge';
import { ACTIONABLE, SAFETY_KIND, timingSummary } from '../../lib/results';
import { lcFirst } from '../../lib/format';

const TONE_TEXT = { stop: 'text-stop', caution: 'text-caution' };

/** "Why am I seeing this?" — the explicit factors, rules and sources behind a result. */
export function WhyThis({ result }) {
  return (
    <Disclosure summary="Why am I seeing this?">
      <div className="space-y-5 rounded-md border border-rule bg-paper-2 p-4 text-sm">
        <div>
          <p className="mb-2 font-semibold text-ink">Based on</p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {result.basedOn.map((b) => (
              <li key={b.factor} className="flex gap-2">
                {b.value === 'Not sure' || b.value === 'Not given' ? (
                  <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
                ) : (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
                )}
                <span>
                  <span className="text-ink-2">{b.label}:</span> {b.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {result.reasons?.length > 0 && (
          <div>
            <p className="mb-2 font-semibold text-ink">Guideline basis</p>
            <ul className="space-y-2">
              {result.reasons.map((r) => {
                const src = result.sources.find((s) => s.id === r.sourceId);
                return (
                  <li key={r.ruleId}>
                    <p>{r.text}</p>
                    <p className="text-ink-3">
                      {src ? (
                        <a href={src.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1">
                          {src.name}
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          <span className="visually-hidden">(opens in a new tab)</span>
                        </a>
                      ) : null}
                      {' · '}
                      {r.section}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <p className="text-xs text-ink-3">
          Rule references: <span className="code">{result.ruleIds.join(', ')}</span>
        </p>
      </div>
    </Disclosure>
  );
}

/** A text link with a trailing arrow — the row-level action voice. */
function RowLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium">
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

/**
 * One line of the results ledger. Desktop: reasoning on the left, a narrow
 * margin column with status, timing and the row's actions on the right.
 * Mobile: title, status, reasoning, actions. Page-level primary actions live
 * in the page header, so rows carry text links rather than filled buttons.
 */
export default function RecommendationRow({ result }) {
  const timing = timingSummary(result.timing);
  const actionable = ACTIONABLE.has(result.status);

  return (
    <article
      className="grid gap-x-10 gap-y-3 border-t border-rule py-6 md:grid-cols-[minmax(0,1fr)_15rem]"
      aria-labelledby={`rec-${result.vaccineId}`}
    >
      <header className="min-w-0 md:col-start-1 md:row-start-1">
        <h3 id={`rec-${result.vaccineId}`} className="text-xl">
          <Link to={`/vaccines/${result.vaccineId}`} className="text-ink no-underline hover:underline">
            {result.name}
          </Link>
        </h3>
        <p className="text-sm text-ink-3">Protects against {lcFirst(result.protectsAgainst)}</p>
      </header>

      <div className="space-y-2 md:col-start-2 md:row-start-1">
        <StatusBadge status={result.status} />
        {timing && (
          <p className="text-sm">
            <span className="block text-ink-3">Timing</span>
            <span className="font-medium text-ink">{timing}</span>
          </p>
        )}
      </div>

      <div className="min-w-0 space-y-3 md:col-start-1 md:row-start-2">
        <p className="prose-measure text-ink">{result.headline}</p>

        {result.safety?.length > 0 && (
          <ul className="space-y-2">
            {result.safety.map((s) => {
              const kind = SAFETY_KIND[s.kind];
              return (
                <li key={s.ruleId} className="text-sm">
                  <span className={`font-semibold ${TONE_TEXT[kind.tone]}`}>{kind.label}: </span>
                  {s.kind === 'unresolved' ? (
                    <>We couldn’t rule this out: {s.text.charAt(0).toLowerCase() + s.text.slice(1)}</>
                  ) : (
                    s.text
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {result.missing?.length > 0 && (
          <div className="text-sm">
            <p className="text-ink-2">Information that would help:</p>
            <ul className="list-disc pl-5 text-ink">
              {result.missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <WhyThis result={result} />
      </div>

      <div className="flex flex-wrap gap-x-5 md:col-start-2 md:row-start-2 md:flex-col md:self-start">
        {actionable && <RowLink to={`/providers?vaccine=${result.vaccineId}`}>Find providers</RowLink>}
        {result.status === 'INSUFFICIENT_INFORMATION' && (
          <RowLink to="/start/history?return=review">Add information</RowLink>
        )}
        <RowLink to={`/vaccines/${result.vaccineId}`}>Full details and safety</RowLink>
      </div>
    </article>
  );
}
