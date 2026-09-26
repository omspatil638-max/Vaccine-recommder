import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataState from '../../components/ui/DataState';
import Notice from '../../components/ui/Notice';
import { useIntake, useStepNav } from './IntakeContext';

/**
 * Shared frame for a wizard step: title, purpose, the form, and a Back /
 * Continue bar that sticks to the bottom on small screens.
 * `onSubmit` returns a promise; errors surface as a summary at the top.
 */
export default function StepFrame({ stepKey, title, purpose, onSubmit, children, submitLabel }) {
  const { data, catalog, error } = useIntake();
  const nav = useStepNav(stepKey);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  if (error) {
    return (
      <DataState kind="error" title="We couldn’t load your information">
        {error.message}
      </DataState>
    );
  }
  if (!data || !catalog) return <DataState kind="loading" title="Loading your information…" />;

  const submit = async (ev) => {
    ev.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const ok = await onSubmit();
      if (ok !== false) nav.goNext();
    } catch (err) {
      setFormError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} onInput={() => formError && setFormError(null)} noValidate className="pb-24 sm:pb-0">
      <header className="mb-8 space-y-2">
        <h1 className="text-statement">{title}</h1>
        <p className="prose-measure text-lg text-ink-2">{purpose}</p>
      </header>

      {formError && (
        <Notice tone="error" title="Please check your answers" className="mb-6">
          {formError}
        </Notice>
      )}

      <div className="space-y-12">{children}</div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper px-4 py-3 sm:static sm:mt-12 sm:border-t sm:px-0 sm:pt-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {nav.backTo ? (
            <Button to={nav.backTo} variant="quiet" className="-ml-2">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" size="lg" loading={saving} loadingLabel="Saving…">
            {submitLabel ?? nav.continueLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

/** A titled group of questions inside a step. */
export function Section({ title, description, children }) {
  return (
    <section className="space-y-5 border-t border-rule pt-8 first:border-t-0 first:pt-0">
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-2xl">{title}</h2>}
          {description && <p className="prose-measure text-ink-2">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/** A short line explaining why we ask something. */
export function Why({ children }) {
  return <p className="text-sm text-ink-3">{children}</p>;
}
