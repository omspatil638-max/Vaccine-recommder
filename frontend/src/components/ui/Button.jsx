import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-semibold ' +
  'whitespace-nowrap transition-colors duration-150 ease-out select-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

const SIZES = {
  md: '',
  lg: 'min-h-12 px-6 text-base',
};

const VARIANTS = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover active:translate-y-px',
  secondary:
    'border border-rule-strong bg-paper text-ink hover:bg-paper-2 active:bg-paper-3 active:translate-y-px',
  quiet: 'px-2 text-accent underline-offset-4 hover:underline hover:text-accent-hover',
  danger: 'border border-stop text-stop bg-paper hover:bg-stop-soft active:translate-y-px',
};

/**
 * Button with the full state set: default, hover, focus-visible (global ring),
 * active, disabled, loading. Pass `to` to render a router link styled as a button.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = 'Working…',
  disabled = false,
  to,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={`${classes} no-underline hover:no-underline`} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
