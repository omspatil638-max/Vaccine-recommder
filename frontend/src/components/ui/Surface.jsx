import { vaccineCategory } from '../../lib/vaccineMeta';

/**
 * Layout primitives from the design system (design.md revision 5). Values
 * come from tally's console pattern in the Hallmark reference: cards on
 * `surface` with a hairline and a whisper shadow, 12px radius; a two-column
 * section head (title left, description right, bottom-aligned) that stacks
 * on phones; stat tiles with a small label over a display-face value.
 */

/** A real object on the page (a recommendation, a provider, a dose). */
export function Card({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-md border border-rule bg-surface p-6 shadow-card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/** A full-width tinted band that separates one section from the next. */
export function Band({ tone = 'paper-2', className = '', children }) {
  const tones = { 'paper-2': 'bg-paper-2', sky: 'bg-sky', deep: 'bg-deep text-on-deep' };
  return <div className={`rounded-lg px-6 py-12 sm:px-12 ${tones[tone]} ${className}`}>{children}</div>;
}

/** Section title + one line of context; the optional action sits with the description. */
export function SectionHead({ id, title, description, action, className = '' }) {
  return (
    <div className={`mb-8 grid gap-4 md:grid-cols-2 md:items-end md:gap-12 ${className}`}>
      <h2 id={id} className="text-2xl">
        {title}
      </h2>
      {(description || action) && (
        <div className="flex flex-col gap-3 md:items-end md:text-right">
          {description && <p className="max-w-[50ch] text-ink-2">{description}</p>}
          {action}
        </div>
      )}
    </div>
  );
}

/** A key figure. Only for real counts from the user's own data, never invented numbers. */
export function StatTile({ label, value, note, icon: Icon, tone = 'default' }) {
  const tones = {
    default: 'text-ink',
    attention: 'text-attention',
    ok: 'text-ok',
    stop: 'text-stop',
  };
  return (
    <div className="rounded-md border border-rule bg-surface p-5 shadow-card">
      <p className="flex items-center gap-2 text-sm font-medium text-ink-2">
        {Icon && <Icon className={`h-4 w-4 ${tones[tone]}`} aria-hidden="true" />}
        {label}
      </p>
      <p className={`data mt-1 font-display text-3xl font-bold tracking-tight ${tones[tone]}`}>{value}</p>
      {note && <p className="mt-1 text-sm text-ink-3">{note}</p>}
    </div>
  );
}

/** The category icon for a vaccine, in a tinted disc. */
export function VaccineIcon({ vaccineId, size = 'md' }) {
  const { icon: Icon, label } = vaccineCategory(vaccineId);
  const sizes = { sm: 'h-8 w-8 [&>svg]:h-4 [&>svg]:w-4', md: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5' };
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent ${sizes[size]}`} title={label}>
      <Icon aria-hidden="true" />
    </span>
  );
}
