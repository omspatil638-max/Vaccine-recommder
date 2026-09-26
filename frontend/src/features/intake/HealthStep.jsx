import { useState } from 'react';
import { TRI_OPTIONS, TriChoice } from '../../components/ui/Choice';
import { useIntake } from './IntakeContext';
import StepFrame, { Section, Why } from './StepFrame';
import { useFieldErrors } from '../../lib/useFieldErrors';

/** A compact row of Yes / No / Not sure for one condition. */
function TriRow({ label, value, onChange, error }) {
  const name = `c-${label}`;
  return (
    <fieldset className="grid gap-2 border-b border-rule py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <legend className="contents">
        <span className="text-base text-ink">{label}</span>
      </legend>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {TRI_OPTIONS.map((o) => (
          <label
            key={o.value}
            className={`flex min-h-11 min-w-[4.5rem] cursor-pointer items-center justify-center gap-2 rounded-sm border px-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
              value === o.value ? 'border-accent bg-accent-soft font-semibold' : 'border-rule-strong hover:bg-paper-2'
            } ${error && !value ? 'border-stop' : ''}`}
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function HealthStep() {
  const { data, catalog, save } = useIntake();
  const h = data?.health ?? {};
  const conditions = catalog?.conditions ?? [];
  const isUS = data?.location?.country_code === 'US';
  const [form, setForm] = useState({
    conditions: Object.fromEntries(conditions.map((c) => [c.code, h.conditions?.[c.code] ?? ''])),
    immunocompromised: h.immunocompromised ?? '',
    severe_immunodeficiency: h.severe_immunodeficiency ?? '',
    healthcare_personnel: h.healthcare_personnel ?? '',
    student_traveler_contact: h.student_traveler_contact ?? '',
  });
  const [errors, setErrors] = useFieldErrors(form);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const e = {};
    if (conditions.some((c) => !form.conditions[c.code])) e.conditions = 'Answer each condition. “Not sure” is fine.';
    if (!form.immunocompromised) e.immunocompromised = 'Choose an answer.';
    if (form.immunocompromised === 'yes' && !form.severe_immunodeficiency) e.severe_immunodeficiency = 'Choose an answer.';
    if (!form.healthcare_personnel) e.healthcare_personnel = 'Choose an answer.';
    if (isUS && !form.student_traveler_contact) e.student_traveler_contact = 'Choose an answer.';
    setErrors(e);
    if (Object.keys(e).length) throw new Error(Object.values(e)[0]);
    await save('health', {
      conditions: form.conditions,
      immunocompromised: form.immunocompromised,
      severe_immunodeficiency: form.immunocompromised === 'yes' ? form.severe_immunodeficiency : 'no',
      healthcare_personnel: form.healthcare_personnel,
      student_traveler_contact: isUS ? form.student_traveler_contact : 'unsure',
    });
  };

  return (
    <StepFrame
      stepKey="health"
      title="Let’s check relevant health information"
      purpose="Some long-term conditions and treatments change which vaccines are recommended, or how they’re given. Answer what you know; “Not sure” is always an option."
      onSubmit={submit}
    >
      <Section
        title="Long-term conditions"
        description="Do you have any of these? These conditions mean some vaccines are recommended earlier."
      >
        <div>
          {conditions.map((c) => (
            <TriRow
              key={c.code}
              label={c.label}
              value={form.conditions[c.code]}
              error={errors.conditions}
              onChange={(v) => setForm((f) => ({ ...f, conditions: { ...f.conditions, [c.code]: v } }))}
            />
          ))}
        </div>
        {errors.conditions && (
          <p className="text-sm text-stop" role="alert">
            {errors.conditions}
          </p>
        )}
      </Section>

      <Section title="Your immune system">
        <TriChoice
          legend="Do you have a weakened immune system?"
          hint="For example from cancer treatment, an organ transplant, long-term steroids or other immune-suppressing medicines, HIV, or a condition you were born with."
          value={form.immunocompromised}
          onChange={set('immunocompromised')}
          error={errors.immunocompromised}
        />
        {form.immunocompromised === 'yes' && (
          <TriChoice
            legend="Has a doctor told you your immune system is severely weakened?"
            hint="For example during chemotherapy, after a transplant, or with a very low CD4 count. Live vaccines are not given in this case."
            value={form.severe_immunodeficiency}
            onChange={set('severe_immunodeficiency')}
            error={errors.severe_immunodeficiency}
          />
        )}
      </Section>

      <Section title="Your work and circumstances">
        <TriChoice
          legend="Do you work in healthcare?"
          hint="Including work where you might have contact with patients, blood or body fluids."
          value={form.healthcare_personnel}
          onChange={set('healthcare_personnel')}
          error={errors.healthcare_personnel}
        />
        {isUS && (
          <TriChoice
            legend="Are you a student after high school, planning international travel, or living with someone who has a weakened immune system?"
            hint="These situations change how many MMR doses are recommended."
            value={form.student_traveler_contact}
            onChange={set('student_traveler_contact')}
            error={errors.student_traveler_contact}
          />
        )}
        <Why>We don’t ask for diagnoses or medicine names beyond what the guidelines need.</Why>
      </Section>
    </StepFrame>
  );
}
