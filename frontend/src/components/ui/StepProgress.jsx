import { Check } from 'lucide-react';

/**
 * Wizard progress. Desktop: labelled steps. Mobile: "Step n of N · Label" + bar.
 * `steps` = [{ key, label }], `current` = key of the active step,
 * `completed` = Set of completed keys.
 */
export default function StepProgress({ steps, current, completed = new Set() }) {
  const index = Math.max(
    0,
    steps.findIndex((s) => s.key === current),
  );
  const pct = Math.round(((index + 1) / steps.length) * 100);

  return (
    <nav aria-label="Progress">
      <p className="text-sm text-ink-2 md:hidden">
        Step <span className="data">{index + 1}</span> of <span className="data">{steps.length}</span>
        <span aria-hidden="true"> · </span>
        <span className="font-semibold text-ink">{steps[index]?.label}</span>
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-paper-3 md:hidden" aria-hidden="true">
        <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${pct}%` }} />
      </div>

      <ol className="hidden items-center gap-2 md:flex">
        {steps.map((step, i) => {
          const isCurrent = step.key === current;
          const isDone = completed.has(step.key) && !isCurrent;
          return (
            <li key={step.key} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex shrink-0 items-center gap-2 text-sm ${
                  isCurrent ? 'font-semibold text-ink' : isDone ? 'text-ink-2' : 'text-ink-3'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs data ${
                    isCurrent
                      ? 'border-accent bg-accent text-on-accent'
                      : isDone
                        ? 'border-accent text-accent'
                        : 'border-rule-strong text-ink-3'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span>{step.label}</span>
                {isDone && <span className="visually-hidden">(completed)</span>}
              </span>
              {i < steps.length - 1 && (
                <span className={`h-0.5 min-w-3 flex-1 rounded-full ${isDone ? 'bg-accent' : 'bg-rule'}`} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
