import { CheckCircle2, CircleDashed, CircleSlash, CloudOff, HelpCircle } from 'lucide-react';
import { formatDate, formatMoney } from '../../lib/format';

const STATES = {
  AVAILABLE: { label: 'Available', icon: CheckCircle2, cls: 'text-ok' },
  LIMITED: { label: 'Limited', icon: CircleDashed, cls: 'text-caution' },
  UNAVAILABLE: { label: 'Unavailable', icon: CircleSlash, cls: 'text-stop' },
  NOT_VERIFIED: { label: 'Not verified', icon: HelpCircle, cls: 'text-info' },
  DATA_UNAVAILABLE: { label: 'No data', icon: CloudOff, cls: 'text-ink-3' },
};

export function AvailabilityState({ state, lastVerified }) {
  const s = STATES[state] ?? STATES.DATA_UNAVAILABLE;
  const Icon = s.icon;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 text-sm">
      <Icon className={`h-4 w-4 shrink-0 ${s.cls}`} aria-hidden="true" />
      <span className={`font-medium ${s.cls}`}>{s.label}</span>
      {lastVerified ? (
        <span className="text-ink-3">
          · checked <span className="data">{formatDate(lastVerified)}</span>
        </span>
      ) : (
        <span className="text-ink-3">· never checked</span>
      )}
    </span>
  );
}

/** Vaccine price + service fee = total, or an explicit "not available". Never a guess. */
export function CostBreakdown({ price }) {
  if (!price) return <p className="text-sm text-ink-3">Price not available</p>;
  const { vaccine, admin_fee: fee, total, currency } = price;
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
      <dt className="text-ink-2">Vaccine</dt>
      <dd className="data text-right">{formatMoney(vaccine, currency)}</dd>
      <dt className="text-ink-2">Service fee</dt>
      <dd className="data text-right">{formatMoney(fee, currency)}</dd>
      <dt className="border-t border-rule pt-1 font-semibold">Estimated total</dt>
      <dd className="data border-t border-rule pt-1 text-right font-semibold">{formatMoney(total, currency)}</dd>
      {price.note && <dd className="col-span-2 pt-1 text-ink-3">{price.note}</dd>}
    </dl>
  );
}
