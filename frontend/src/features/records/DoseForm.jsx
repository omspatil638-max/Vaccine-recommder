import { useState } from 'react';
import Button from '../../components/ui/Button';
import { ChoiceGroup } from '../../components/ui/Choice';
import { SelectField, TextField } from '../../components/ui/FormField';
import Notice from '../../components/ui/Notice';
import { api } from '../../lib/api';
import { todayIso } from '../../lib/format';
import { useFieldErrors } from '../../lib/useFieldErrors';

const PRECISION = [
  { value: 'day', label: 'Exact date' },
  { value: 'month', label: 'Month and year' },
  { value: 'year', label: 'Year only' },
  { value: 'unknown', label: 'I don’t know the date' },
];

/**
 * Add one vaccination dose. Dates can be exact, approximate, or unknown —
 * uncertainty is stored as such, never guessed.
 */
export default function DoseForm({ vaccines, products, fixedVaccine, onSaved, onCancel, submitLabel = 'Save dose', showProvider = false }) {
  const [form, setForm] = useState({
    vaccine_id: fixedVaccine ?? '',
    precision: 'day',
    day: '',
    month: '',
    year: '',
    product: '',
    dose_number: '',
    provider_text: '',
  });
  const [errors, setErrors] = useFieldErrors(form);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));
  const productOptions = products?.[form.vaccine_id];
  const thisYear = new Date().getFullYear();

  const buildDate = () => {
    if (form.precision === 'day') return form.day;
    if (form.precision === 'month') return form.month ? `${form.month}-01` : '';
    if (form.precision === 'year') return form.year ? `${form.year}-01-01` : '';
    return null;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const e = {};
    if (!form.vaccine_id) e.vaccine_id = 'Choose a vaccine.';
    const date = buildDate();
    if (form.precision !== 'unknown') {
      if (!date) e.date = 'Enter the date, or choose “I don’t know the date”.';
      else if (date > todayIso()) e.date = 'The date can’t be in the future.';
      if (form.precision === 'year' && (Number(form.year) < 1900 || Number(form.year) > thisYear))
        e.date = `Enter a year between 1900 and ${thisYear}.`;
    }
    const doseNumber = form.dose_number === '' ? null : Number(form.dose_number);
    if (doseNumber != null && (!Number.isInteger(doseNumber) || doseNumber < 1 || doseNumber > 10))
      e.dose_number = 'Enter a number from 1 to 10.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setFormError(null);
    try {
      const res = await api.post('/intake/records', {
        vaccine_id: form.vaccine_id,
        product: form.product || null,
        date,
        date_precision: form.precision,
        dose_number: doseNumber,
        provider_text: form.provider_text.trim() || null,
      });
      onSaved?.(res);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="space-y-5 rounded-md border border-rule bg-paper-2 p-4 sm:p-5"
      onKeyDown={(e) => {
        // Enter saves this dose rather than submitting a surrounding form.
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
          e.preventDefault();
          submit(e);
        }
      }}
    >
      {formError && <Notice tone="error">{formError}</Notice>}
      {!fixedVaccine && (
        <SelectField
          label="Vaccine"
          placeholder="Choose a vaccine…"
          options={vaccines.map((v) => ({ value: v.id, label: v.name }))}
          value={form.vaccine_id}
          error={errors.vaccine_id}
          onChange={(e) => setForm((f) => ({ ...f, vaccine_id: e.target.value, product: '' }))}
        />
      )}
      <ChoiceGroup legend="When did you get it?" options={PRECISION} value={form.precision} onChange={set('precision')} inline />
      <div className="max-w-xs">
        {form.precision === 'day' && (
          <TextField label="Date" type="date" max={todayIso()} value={form.day} error={errors.date} onChange={set('day')} />
        )}
        {form.precision === 'month' && (
          <TextField
            label="Month and year"
            type="month"
            max={todayIso().slice(0, 7)}
            placeholder="2024-05"
            value={form.month}
            error={errors.date}
            onChange={set('month')}
          />
        )}
        {form.precision === 'year' && (
          <TextField
            label="Year"
            type="number"
            inputMode="numeric"
            min={1900}
            max={thisYear}
            placeholder={String(thisYear - 2)}
            value={form.year}
            error={errors.date}
            hint="With only a year, we can’t check dose timing."
            onChange={set('year')}
          />
        )}
      </div>
      {form.precision === 'unknown' && (
        <p className="text-sm text-ink-2">That’s fine. We’ll record the dose without a date, and say so wherever it matters.</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {productOptions && (
          <SelectField
            label="Which type?"
            optional
            placeholder="Choose…"
            options={Object.entries(productOptions).map(([value, label]) => ({ value, label }))}
            value={form.product}
            onChange={set('product')}
          />
        )}
        <TextField
          label="Dose number"
          optional
          type="number"
          inputMode="numeric"
          min={1}
          max={10}
          value={form.dose_number}
          error={errors.dose_number}
          onChange={set('dose_number')}
        />
        {showProvider && (
          <TextField label="Where you got it" optional value={form.provider_text} maxLength={120} onChange={set('provider_text')} />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={submit} loading={saving} loadingLabel="Saving…">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
