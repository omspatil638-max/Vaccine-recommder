import { Link } from 'react-router';
import { BRAND } from '../lib/brand';

export default function SiteFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {BRAND.name} gives information to support a conversation with a healthcare professional. It is not a
          diagnosis or prescription.
        </p>
        <Link to="/about/sources" className="shrink-0">
          Sources and method
        </Link>
      </div>
    </footer>
  );
}
