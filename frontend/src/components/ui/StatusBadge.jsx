import { STATUS } from './status';

const TONES = {
  ok: 'bg-ok-soft text-ok border-ok/30',
  caution: 'bg-caution-soft text-caution border-caution/30',
  stop: 'bg-stop-soft text-stop border-stop/30',
  info: 'bg-info-soft text-info border-info/30',
  neutral: 'bg-neutral-soft text-neutral border-rule',
  demo: 'bg-demo-soft text-demo border-demo border-dashed',
};

export default function StatusBadge({ status, label, className = '' }) {
  const def = STATUS[status] ?? STATUS.INSUFFICIENT_INFORMATION;
  const Icon = def.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium ${TONES[def.tone]} ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label ?? def.label}
    </span>
  );
}

const ICON_TONES = { ok: 'text-ok', caution: 'text-caution', stop: 'text-stop', info: 'text-info', neutral: 'text-neutral', demo: 'text-demo' };

/** The status icon alone, for places where the label is already written next to it. */
export function StatusIcon({ status }) {
  const def = STATUS[status] ?? STATUS.INSUFFICIENT_INFORMATION;
  const Icon = def.icon;
  return <Icon className={`h-4 w-4 shrink-0 ${ICON_TONES[def.tone]}`} aria-hidden="true" />;
}

export function DemoBadge({ className = '' }) {
  return <StatusBadge status="DEMO" className={className} />;
}
