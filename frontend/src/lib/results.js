import { formatDate } from './format';

/** Status groups for the results page, in reading order. */
export const GROUPS = [
  { status: 'RECOMMENDED', inline: 'recommended', title: 'Recommended for you', lede: 'Based on your answers and the guideline, these are recommended.' },
  { status: 'MAY_BE_APPROPRIATE', inline: 'worth discussing', title: 'Worth discussing', lede: 'The guideline says these may be appropriate. It’s a decision to make with a healthcare professional.' },
  { status: 'REVIEW_WITH_PROFESSIONAL', inline: 'to check with a professional first', title: 'Check with a healthcare professional first', lede: 'Something in your answers needs a professional’s advice before these vaccines.' },
  { status: 'INSUFFICIENT_INFORMATION', inline: 'with information missing', title: 'We need more information', lede: 'We can’t tell yet. Adding the missing details will give you a clearer answer.' },
  { status: 'CONTRAINDICATION', inline: 'not recommended right now', title: 'Not recommended for you right now', lede: 'Your answers match a reason these vaccines shouldn’t be given at the moment.' },
  { status: 'UP_TO_DATE', inline: 'up to date', title: 'Up to date', lede: 'Your answers show you’ve had what’s recommended.' },
  { status: 'NOT_INDICATED', inline: 'not currently indicated', title: 'Not currently indicated', lede: 'Based on your answers, these aren’t part of your recommended schedule right now.' },
];

export const ACTIONABLE = new Set(['RECOMMENDED', 'MAY_BE_APPROPRIATE']);

/** Plain-language answer to "Can I have it now, and what's next?" */
export function timingSummary(timing) {
  if (!timing) return null;
  const multi = timing.dosesRequired > 1;
  switch (timing.state) {
    case 'COMPLETE':
      return timing.recommendedDate ? `Next booster around ${formatDate(timing.recommendedDate)}` : 'Complete';
    case 'DUE':
      return multi ? `Dose ${timing.nextDose} of ${timing.dosesRequired} can be given now` : 'Can be given now';
    case 'NOT_YET': {
      const base = multi
        ? `Dose ${timing.nextDose} of ${timing.dosesRequired} from ${formatDate(timing.earliestDate)}`
        : `From ${formatDate(timing.earliestDate)}`;
      return timing.recommendedDate && timing.recommendedDate !== timing.earliestDate
        ? `${base} (usually around ${formatDate(timing.recommendedDate)})`
        : base;
    }
    case 'UNKNOWN':
      return 'Timing depends on doses you may already have had';
    case 'NEEDS_REVIEW':
      return 'A professional needs to check your previous doses';
    default:
      return null;
  }
}

export const SAFETY_KIND = {
  contraindication: { label: 'Contraindication', tone: 'stop' },
  defer: { label: 'Wait for now', tone: 'stop' },
  precaution: { label: 'Precaution', tone: 'caution' },
  unresolved: { label: 'Needs checking', tone: 'caution' },
};

/** The single most useful next thing to do, from an assessment result. */
export function nextAction(result) {
  const results = result?.results ?? [];
  const due = results.find((r) => ACTIONABLE.has(r.status) && r.timing?.dueNow);
  if (due) return { kind: 'due', result: due };
  const review = results.find((r) => r.status === 'REVIEW_WITH_PROFESSIONAL');
  if (review) return { kind: 'review', result: review };
  const info = results.find((r) => r.status === 'INSUFFICIENT_INFORMATION');
  if (info) return { kind: 'info', result: info };
  const upcoming = results
    .filter((r) => ACTIONABLE.has(r.status) && r.timing?.earliestDate)
    .sort((a, b) => a.timing.earliestDate.localeCompare(b.timing.earliestDate))[0];
  if (upcoming) return { kind: 'upcoming', result: upcoming };
  return null;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** The headline says the outcome in words; the most important group leads. */
export function resultHeadline(groups) {
  const count = (status) => groups.find((g) => g.group.status === status)?.items.length ?? 0;
  const rec = count('RECOMMENDED');
  const may = count('MAY_BE_APPROPRIATE');
  const review = count('REVIEW_WITH_PROFESSIONAL');
  const stop = count('CONTRAINDICATION');
  const info = count('INSUFFICIENT_INFORMATION');
  if (rec) return { status: 'RECOMMENDED', text: `${plural(rec, 'vaccination', 'vaccinations')} recommended for you` };
  if (may) return { status: 'MAY_BE_APPROPRIATE', text: `${plural(may, 'vaccination is', 'vaccinations are')} worth discussing` };
  if (review || stop)
    return { status: 'REVIEW_WITH_PROFESSIONAL', text: 'Some vaccinations need a professional’s advice first' };
  if (info) return { status: 'INSUFFICIENT_INFORMATION', text: 'We need a little more information' };
  return { status: 'UP_TO_DATE', text: 'Nothing needs doing right now' };
}
