import { StatusIcon } from '../../components/ui/StatusBadge';
import { GROUPS } from '../../lib/results';

// Status → fill for the strip. Colour repeats the status meaning; the legend's icon
// and words carry it too, so nothing relies on colour alone.
const FILL = {
  RECOMMENDED: 'bg-ok',
  MAY_BE_APPROPRIATE: 'bg-ok/70',
  UP_TO_DATE: 'bg-ok/40',
  REVIEW_WITH_PROFESSIONAL: 'bg-caution',
  CONTRAINDICATION: 'bg-stop',
  INSUFFICIENT_INFORMATION: 'bg-info',
  NOT_INDICATED: 'bg-rule-strong',
};

/**
 * One mark per vaccine checked, in result-group order. Each mark links to its
 * row and names itself on hover or focus; the legend links to each group.
 */
export function StatusStrip({ groups }) {
  const units = groups.flatMap(({ group, items }) => items.map((r) => ({ ...r, groupStatus: group.status })));
  const total = units.length;
  if (!total) return null;

  return (
    <div className="max-w-2xl space-y-3">
      <ul className="flex gap-0.5" aria-label={`${total} vaccines checked, by result`}>
        {units.map((u) => {
          const label = GROUPS.find((g) => g.status === u.groupStatus)?.title;
          return (
            <li key={u.vaccineId} className="relative min-w-0 flex-1">
              <a
                href={`#rec-${u.vaccineId}`}
                className="group block py-2"
                aria-label={`${u.shortName ?? u.name}: ${label}`}
              >
                <span className={`block h-2.5 rounded-[4px] ${FILL[u.groupStatus]}`} aria-hidden="true" />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-2 py-1 text-xs text-paper group-hover:block group-focus-visible:block"
                >
                  {u.shortName ?? u.name}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm" aria-label="Result groups">
        {groups.map(({ group, items }) => (
          <li key={group.status}>
            <a href={`#group-${group.status}`} className="inline-flex min-h-11 items-center gap-2 no-underline hover:underline">
              <StatusIcon status={group.status} />
              <span className="text-ink">{group.title}</span>
              <span className="data text-ink-3">{items.length}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
