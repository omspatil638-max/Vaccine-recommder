import { Link } from 'react-router';
import { BRAND } from '../lib/brand';

/**
 * The mark is a dose sequence: two doses given, one still to come. It names
 * what the product tracks, rather than borrowing a generic medical cross.
 */
export function DoseMark({ className = 'text-accent' }) {
  return (
    <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden="true" className={className}>
      <path d="M5 6h15.75" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="4" cy="6" r="3.25" fill="currentColor" />
      <circle cx="14" cy="6" r="3.25" fill="currentColor" />
      <circle cx="24" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

/** `onDeep` renders the light version for the brand-blue surfaces. */
export default function Wordmark({ to = '/', onDeep = false }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-11 items-center gap-2.5 no-underline ${
        onDeep ? 'text-on-deep hover:text-on-deep' : 'text-ink hover:text-ink'
      }`}
      aria-label={`${BRAND.name} home`}
    >
      <DoseMark className={onDeep ? 'text-accent-bright' : 'text-accent'} />
      <span className="font-display text-lg font-semibold tracking-tight">{BRAND.name}</span>
    </Link>
  );
}
