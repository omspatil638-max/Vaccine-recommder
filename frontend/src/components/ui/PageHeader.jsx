import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export default function PageHeader({ title, lede, back, actions, children }) {
  return (
    <header className="mb-8 space-y-3">
      {back && (
        <Link to={back.to} className="inline-flex min-h-11 items-center gap-1 text-sm no-underline hover:underline">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-display">{title}</h1>
          {lede && <p className="prose-measure text-lg text-ink-2">{lede}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
