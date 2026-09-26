import {
  AlertTriangle,
  CloudOff,
  FlaskConical,
  HelpCircle,
  Inbox,
  Loader2,
  MessageCircleWarning,
} from 'lucide-react';

/**
 * Named states for incomplete healthcare data. Each explains what is missing
 * rather than showing an empty space.
 */
const KINDS = {
  loading: { icon: Loader2, tone: 'text-ink-2', spin: true, role: 'status' },
  empty: { icon: Inbox, tone: 'text-ink-2' },
  error: { icon: AlertTriangle, tone: 'text-stop', role: 'alert' },
  unavailable: { icon: CloudOff, tone: 'text-ink-2' },
  not_verified: { icon: HelpCircle, tone: 'text-info' },
  review: { icon: MessageCircleWarning, tone: 'text-caution' },
  demo: { icon: FlaskConical, tone: 'text-demo' },
};

export default function DataState({ kind = 'empty', title, children, action, className = '' }) {
  const def = KINDS[kind];
  const Icon = def.icon;
  return (
    <div
      role={def.role}
      aria-live={def.role === 'status' ? 'polite' : undefined}
      className={`flex gap-3 border-y border-rule py-5 ${className}`}
    >
      <Icon
        className={`mt-0.5 h-5 w-5 shrink-0 ${def.tone} ${def.spin ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold text-ink">{title}</p>
        {children && <div className="text-sm text-ink-2">{children}</div>}
        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}
