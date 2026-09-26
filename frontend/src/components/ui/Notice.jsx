import { AlertTriangle, CircleSlash, FlaskConical, Info, MessageCircleWarning, CheckCircle2 } from 'lucide-react';

const TONES = {
  info: { icon: Info, box: 'border-info/30 bg-info-soft', text: 'text-info' },
  caution: { icon: MessageCircleWarning, box: 'border-caution/30 bg-caution-soft', text: 'text-caution' },
  stop: { icon: CircleSlash, box: 'border-stop/30 bg-stop-soft', text: 'text-stop' },
  ok: { icon: CheckCircle2, box: 'border-ok/30 bg-ok-soft', text: 'text-ok' },
  error: { icon: AlertTriangle, box: 'border-stop/40 bg-stop-soft', text: 'text-stop' },
  demo: { icon: FlaskConical, box: 'border-demo border-dashed bg-demo-soft', text: 'text-demo' },
};

/** An inline message with an icon and a title. Meaning never relies on colour alone. */
export default function Notice({ tone = 'info', title, children, className = '', role }) {
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <div
      role={role ?? (tone === 'error' ? 'alert' : undefined)}
      className={`flex gap-3 rounded-md border p-4 ${t.box} ${className}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${t.text}`} aria-hidden="true" />
      <div className="min-w-0 space-y-1 text-sm text-ink">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
