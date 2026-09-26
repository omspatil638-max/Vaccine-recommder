import DataState from '../../components/ui/DataState';
import { SourceList } from '../../components/ui/Provenance';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../lib/format';
import { useResource } from '../../lib/useResource';

const STATUSES = [
  ['RECOMMENDED', 'The guideline recommends it for someone with your answers, and nothing in your safety answers needs checking first.'],
  ['MAY_BE_APPROPRIATE', 'The guideline says it may be given, often as a shared decision with a professional.'],
  ['REVIEW_WITH_PROFESSIONAL', 'A precaution applies, or a safety answer was “Not sure”. A professional should check first.'],
  ['CONTRAINDICATION', 'Your answers match a listed reason not to give the vaccine, or to wait (for example during pregnancy).'],
  ['INSUFFICIENT_INFORMATION', 'We can’t decide without information you haven’t given, such as previous doses.'],
  ['UP_TO_DATE', 'Your recorded doses or evidence of immunity cover what’s recommended.'],
  ['NOT_INDICATED', 'The guideline doesn’t recommend it for someone with your answers.'],
];

export default function SourcesPage() {
  const { data, error, loading } = useResource('/guidelines');

  return (
    <article className="mx-auto max-w-3xl space-y-12 px-4 py-10 sm:px-6 sm:py-16">
      <header className="space-y-3">
        <h1 className="text-display">Sources and method</h1>
        <p className="text-lg text-ink-2">
          How we work out which vaccinations may be relevant to you, which official guidance we use, and what we don’t do.
        </p>
      </header>

      <section className="prose-measure space-y-3">
        <h2 className="text-2xl">How results are worked out</h2>
        <p>
          Your answers are checked against written rules taken from one official guideline: the one for your country. Each rule
          records the document and section it comes from. The same answers always give the same result.
        </p>
        <p>
          Results are not produced by AI. We don’t invent schedules, safety advice, prices or availability. When we don’t
          know something, we say so instead of guessing, and we never treat “not sure” as “no”.
        </p>
        <p>
          This service gives information to support a conversation with a healthcare professional. It does not diagnose,
          prescribe, or replace professional advice.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">What each result means</h2>
        <dl className="space-y-4">
          {STATUSES.map(([s, text]) => (
            <div key={s} className="grid gap-2 sm:grid-cols-[18rem_minmax(0,1fr)]">
              <dt>
                <StatusBadge status={s} />
              </dt>
              <dd className="text-ink-2">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl">Guidelines we use</h2>
        {loading && <DataState kind="loading" title="Loading guidelines…" />}
        {error && <DataState kind="error" title="We couldn’t load the guideline list">{error.message}</DataState>}
        {data?.map((g) => (
          <div key={g.id} className="space-y-3 border-t border-rule pt-6">
            <h3 className="text-xl">{g.name}</h3>
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[10rem_minmax(0,1fr)]">
              <dt className="text-ink-3">Country</dt>
              <dd>{g.jurisdiction === 'US' ? 'United States' : g.jurisdiction === 'IN' ? 'India' : g.jurisdiction}</dd>
              <dt className="text-ink-3">Publisher</dt>
              <dd>{g.publisher}</dd>
              <dt className="text-ink-3">Version</dt>
              <dd className="data">{g.version}</dd>
              <dt className="text-ink-3">Last checked</dt>
              <dd className="data">{formatDate(g.last_verified)}</dd>
              <dt className="text-ink-3">Covers</dt>
              <dd>{g.population?.description}</dd>
              <dt className="text-ink-3">Vaccines assessed</dt>
              <dd>{g.vaccines.join(', ')}</dd>
            </dl>
            <p className="text-sm text-ink-2">{g.scope_note}</p>
            {g.status_note && <p className="text-sm text-ink-2">{g.status_note}</p>}
            <SourceList sources={g.sources} />
          </div>
        ))}
        <p className="text-sm text-ink-2">
          For other countries we don’t yet have a guideline, so we don’t assess vaccinations there. We never apply one
          country’s guidance to someone living in another.
        </p>
      </section>

      <section className="prose-measure space-y-3">
        <h2 className="text-2xl">Providers, availability and prices</h2>
        <p>
          No live provider data source is connected. Provider, availability and price information in this version is{' '}
          <strong>demo data</strong>: simulated records, always labelled, never presented as real.
        </p>
      </section>

      <section className="prose-measure space-y-3">
        <h2 className="text-2xl">Your data</h2>
        <p>
          We collect only what the guidelines depend on. Location is stored approximately (to about 1 km) and only if you share
          it. Our change log records which fields changed, not their values. You can download or delete your data at any time
          from Settings.
        </p>
      </section>
    </article>
  );
}
