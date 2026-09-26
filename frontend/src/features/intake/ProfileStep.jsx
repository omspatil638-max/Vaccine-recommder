import { useState } from 'react';
import { ChoiceGroup } from '../../components/ui/Choice';
import { TextField } from '../../components/ui/FormField';
import { useIntake } from './IntakeContext';
import StepFrame, { Section, Why } from './StepFrame';
import { useFieldErrors } from '../../lib/useFieldErrors';

const SEX_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

const PREGNANCY_OPTIONS = [
  { value: 'pregnant', label: 'Yes, I’m pregnant' },
  { value: 'not_pregnant', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

function ageFrom(dob) {
  if (!dob) return null;
  const [y, m, d] = dob.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age -= 1;
  return age;
}

export default function ProfileStep() {
  const { data, save } = useIntake();
  const p = data?.profile ?? {};
  const [form, setForm] = useState({
    full_name: p.full_name ?? '',
    birth_date: p.birth_date ?? '',
    sex_at_birth: p.sex_at_birth ?? '',
    pregnancy_status: p.pregnancy_status && p.pregnancy_status !== 'not_applicable' ? p.pregnancy_status : '',
    pregnancy_weeks: p.pregnancy_weeks ?? '',
  });
  const [errors, setErrors] = useFieldErrors(form);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));
  const askPregnancy = form.sex_at_birth && form.sex_at_birth !== 'male';
  const age = ageFrom(form.birth_date);

  const submit = async () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Enter your name.';
    if (!form.birth_date) e.birth_date = 'Enter your date of birth.';
    else if (age < 18) e.birth_date = 'This service is for adults aged 18 and over.';
    else if (age > 120 || Number.isNaN(age)) e.birth_date = 'Check the year of birth.';
    if (!form.sex_at_birth) e.sex_at_birth = 'Choose an answer.';
    if (askPregnancy && !form.pregnancy_status) e.pregnancy_status = 'Choose an answer, or “Not sure”.';
    const weeks = form.pregnancy_weeks === '' ? null : Number(form.pregnancy_weeks);
    if (form.pregnancy_status === 'pregnant' && weeks != null && (weeks < 1 || weeks > 42 || !Number.isInteger(weeks)))
      e.pregnancy_weeks = 'Enter a whole number of weeks between 1 and 42.';
    setErrors(e);
    if (Object.keys(e).length) throw new Error('Some answers need your attention.');
    await save('profile', {
      full_name: form.full_name,
      birth_date: form.birth_date,
      sex_at_birth: form.sex_at_birth,
      pregnancy_status: askPregnancy ? form.pregnancy_status : 'not_applicable',
      pregnancy_weeks: form.pregnancy_status === 'pregnant' ? weeks : null,
    });
  };

  return (
    <StepFrame
      stepKey="profile"
      title="Let’s understand your vaccination needs"
      purpose="A few basics about you. We only ask for what the vaccination guidelines depend on."
      onSubmit={submit}
    >
      <Section>
        <TextField
          label="Full name"
          autoComplete="name"
          value={form.full_name}
          error={errors.full_name}
          hint="So your records and reminders are clearly yours."
          onChange={set('full_name')}
        />
        <div className="max-w-xs">
          <TextField
            label="Date of birth"
            type="date"
            autoComplete="bday"
            max={new Date().toISOString().slice(0, 10)}
            value={form.birth_date}
            error={errors.birth_date}
            hint={age != null && age >= 0 && !errors.birth_date ? `Age ${age}. Many recommendations depend on age.` : 'Many recommendations depend on your exact age.'}
            onChange={set('birth_date')}
          />
        </div>
      </Section>

      <Section>
        <ChoiceGroup
          legend="Sex assigned at birth"
          hint="Some guidance, such as vaccination during pregnancy, depends on this."
          options={SEX_OPTIONS}
          value={form.sex_at_birth}
          onChange={set('sex_at_birth')}
          error={errors.sex_at_birth}
          inline
        />
      </Section>

      {askPregnancy && (
        <Section>
          <ChoiceGroup
            legend="Are you pregnant?"
            hint="Some vaccines are recommended in pregnancy, and some should wait until after."
            options={PREGNANCY_OPTIONS}
            value={form.pregnancy_status}
            onChange={set('pregnancy_status')}
            error={errors.pregnancy_status}
            inline
          />
          {form.pregnancy_status === 'pregnant' && (
            <div className="max-w-xs">
              <TextField
                label="How many weeks pregnant are you?"
                optional
                type="number"
                inputMode="numeric"
                min={1}
                max={42}
                value={form.pregnancy_weeks}
                error={errors.pregnancy_weeks}
                hint="If you know. It lets us work out the timing for vaccines given in pregnancy."
                onChange={set('pregnancy_weeks')}
              />
            </div>
          )}
          <Why>If you’re not sure, choose “Not sure”. We’ll ask a professional to check anything that depends on it.</Why>
        </Section>
      )}
    </StepFrame>
  );
}
