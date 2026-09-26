import { useId } from 'react';

const CONTROL =
  'block w-full min-h-11 rounded-sm border bg-paper px-3 text-base text-ink ' +
  'placeholder:text-ink-3 transition-colors duration-150 ' +
  'hover:border-ink-3 disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-3';

function controlClass(error) {
  return `${CONTROL} ${error ? 'border-stop' : 'border-rule-strong'}`;
}

/**
 * Label above, optional hint below; an error replaces the hint and is announced.
 * `children` is a render function receiving the accessibility props for the control.
 */
export default function FormField({ label, hint, error, optional = false, children }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-3">(optional)</span>}
      </label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        className: controlClass(error),
      })}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-stop" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ label, hint, error, optional, ...inputProps }) {
  return (
    <FormField label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => <input {...a11y} {...inputProps} />}
    </FormField>
  );
}

export function SelectField({ label, hint, error, optional, options, placeholder, ...selectProps }) {
  return (
    <FormField label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => (
        <select {...a11y} {...selectProps}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}
