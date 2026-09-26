import { ExternalLink } from 'lucide-react';
import { formatDate } from '../../lib/format';

/** One line: which guideline, which version, when we last checked it. */
export function ProvenanceLine({ guideline, className = '' }) {
  if (!guideline) return null;
  return (
    <p className={`text-sm text-ink-3 ${className}`}>
      Based on <span className="text-ink-2">{guideline.name}</span>, <span className="data">{guideline.version}</span>.
      Last checked <span className="data">{formatDate(guideline.last_verified)}</span>.
    </p>
  );
}

/** A list of cited sources with publication and retrieval dates. */
export function SourceList({ sources, className = '' }) {
  if (!sources?.length) return null;
  return (
    <ul className={`space-y-3 ${className}`}>
      {sources.map((s) => (
        <li key={s.id} className="text-sm">
          <a href={s.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-start gap-1 font-medium">
            {s.name}
            <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="visually-hidden">(opens in a new tab)</span>
          </a>
          <span className="block text-ink-3">
            {s.publisher}
            {s.published ? (
              <>
                {' · '}published <span className="data">{formatDate(s.published)}</span>
              </>
            ) : (
              ' · publication date not stated'
            )}
            {' · '}checked <span className="data">{formatDate(s.retrieved_at)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
