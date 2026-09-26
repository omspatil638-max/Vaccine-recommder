import { useId } from 'react';

/**
 * Radio group rendered as large, tappable options. Used for Yes / No / Not sure
 * and other single choices. Proper fieldset/legend semantics; keyboard arrows
 * work natively because these are real radio inputs.
 */
export function ChoiceGroup({ legend, hint, error, options, value, onChange, name, inline = false, className = '' }) {
  const id = useId();
  const groupName = name ?? id;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className={`space-y-2 ${className}`} aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
      <legend className="mb-1 font-display text-lg font-bold tracking-tight text-ink">{legend}</legend>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-ink-3">
          {hint}
        </p>
      )}
      <div className={inline ? 'flex flex-wrap gap-2' : 'grid gap-2'}>
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 text-base transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                checked ? 'border-accent bg-accent-soft text-ink' : 'border-rule-strong bg-paper hover:bg-paper-2'
              } ${error && !value ? 'border-stop' : ''}`}
            >
              <input
                type="radio"
                name={groupName}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="min-w-0">
                <span className={checked ? 'font-semibold' : ''}>{opt.label}</span>
                {opt.description && <span className="block text-sm text-ink-3">{opt.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-stop" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export const TRI_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

/** Yes / No / Not sure. "Not sure" is a first-class answer, never folded into "No". */
export function TriChoice(props) {
  return <ChoiceGroup inline options={TRI_OPTIONS} {...props} />;
}
