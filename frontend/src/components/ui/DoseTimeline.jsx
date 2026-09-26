import { Check } from 'lucide-react';
import { formatDate } from '../../lib/format';

/**
 * Horizontal (desktop) / vertical (mobile) dose sequence built from the
 * engine's timing output. Every date shown was calculated by the engine.
 */
export default function DoseTimeline({ timing }) {
  if (!timing || !timing.dosesRequired || timing.dosesRequired < 1) return null;
  const doses = Array.from({ length: timing.dosesRequired }, (_, i) => i + 1);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start" aria-label="Doses">
      {doses.map((n, i) => {
        const done = n <= timing.dosesCounted;
        const isNext = n === timing.nextDose;
        const date = done ? timing.countedDates?.[i] : isNext ? timing.earliestDate : null;
        return (
          <li key={n} className="relative flex gap-3 pb-5 sm:flex-1 sm:flex-col sm:pb-0 sm:pr-4">
            {i < doses.length - 1 && (
              <span
                className="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px bg-rule sm:left-7 sm:top-3 sm:h-px sm:w-[calc(100%-1.75rem)]"
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs data ${
                done ? 'border-ok bg-ok text-on-accent' : isNext ? 'border-accent bg-paper text-accent' : 'border-rule-strong bg-paper text-ink-3'
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}
            </span>
            <span className="min-w-0 text-sm">
              <span className="block font-semibold text-ink">Dose {n}</span>
              <span className="block text-ink-2">
                {done
                  ? date
                    ? `Received ${formatDate(date)}`
                    : 'Received (date unknown)'
                  : isNext
                    ? timing.dueNow
                      ? 'Can be given now'
                      : date
                        ? `From ${formatDate(date)}`
                        : 'Next'
                    : 'Later'}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
