import { useState } from 'react';
import { Plus, ShieldAlert, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ChoiceGroup, TriChoice } from '../../components/ui/Choice';
import { SelectField, TextField } from '../../components/ui/FormField';
import Notice from '../../components/ui/Notice';
import { useIntake } from './IntakeContext';
import StepFrame, { Section, Why } from './StepFrame';
import { useFieldErrors } from '../../lib/useFieldErrors';

const CATEGORY_LABELS = {
  food: 'Food',
  medication: 'Medicine',
  vaccine_ingredient: 'Vaccine ingredient',
  environment: 'Environment (pollen, insects, latex…)',
  other: 'Other',
};

const SEVERITY = [
  { value: 'anaphylaxis', label: 'Severe (anaphylaxis)', description: 'Trouble breathing, swelling of the throat, collapse, or needing emergency treatment' },
  { value: 'non_severe', label: 'Not severe', description: 'Such as a rash, itching or an upset stomach' },
  { value: 'unknown', label: 'Not sure how severe' },
];

const emptyAllergy = { category: '', substance: '', substance_other: '', severity: '' };
const emptyReaction = { vaccine_id: '', kind: '', note: '' };

export default function SafetyStep() {
  const { data, catalog, save } = useIntake();
  const s = data?.safety ?? {};
  const setId = data?.guideline?.id;
  const vaccineOptions = [
    ...Object.values(catalog.vaccinesBySet).flat().filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
      .filter((v) => !setId || catalog.vaccinesBySet[setId].some((x) => x.id === v.id))
      .map((v) => ({ value: v.id, label: v.name })),
    { value: 'unknown', label: 'Not sure which vaccine' },
  ];

  const [form, setForm] = useState({
    allergy_triage: s.allergy_triage ?? '',
    allergies: s.allergies?.length ? s.allergies.map((a) => ({ ...emptyAllergy, ...a })) : [],
    reaction_triage: s.reaction_triage ?? '',
    reactions: s.reactions?.length ? s.reactions.map((r) => ({ ...emptyReaction, ...r })) : [],
    answers: Object.fromEntries(catalog.safetyQuestions.map((q) => [q.code, s.answers?.[q.code] ?? ''])),
  });
  const [errors, setErrors] = useFieldErrors(form);

  const setList = (key, i, patch) =>
    setForm((f) => ({ ...f, [key]: f[key].map((item, j) => (j === i ? { ...item, ...patch } : item)) }));
  const addItem = (key, empty) => setForm((f) => ({ ...f, [key]: [...f[key], { ...empty }] }));
  const removeItem = (key, i) => setForm((f) => ({ ...f, [key]: f[key].filter((_, j) => j !== i) }));

  const submit = async () => {
    const e = {};
    if (!form.allergy_triage) e.allergy_triage = 'Choose an answer.';
    if (form.allergy_triage === 'yes') {
      if (!form.allergies.length) e.allergy_triage = 'Add at least one allergy, or choose “Not sure”.';
      form.allergies.forEach((a, i) => {
        if (!a.category || !a.substance || !a.severity) e[`allergy-${i}`] = 'Complete this allergy, or remove it.';
      });
    }
    if (!form.reaction_triage) e.reaction_triage = 'Choose an answer.';
    if (form.reaction_triage === 'yes') {
      if (!form.reactions.length) e.reaction_triage = 'Add the reaction, or choose “Not sure”.';
      form.reactions.forEach((r, i) => {
        if (!r.vaccine_id || !r.kind) e[`reaction-${i}`] = 'Complete this reaction, or remove it.';
      });
    }
    for (const q of catalog.safetyQuestions) if (!form.answers[q.code]) e[q.code] = 'Choose an answer.';
    setErrors(e);
    if (Object.keys(e).length) throw new Error('Some answers need your attention. “Not sure” is always an option.');
    await save('safety', {
      allergy_triage: form.allergy_triage,
      allergies:
        form.allergy_triage === 'yes'
          ? form.allergies.map((a) => ({ ...a, substance_other: a.substance === 'other' ? a.substance_other || null : null }))
          : [],
      reaction_triage: form.reaction_triage,
      reactions: form.reaction_triage === 'yes' ? form.reactions.map((r) => ({ ...r, note: r.note || null })) : [],
      answers: form.answers,
    });
  };

  return (
    <StepFrame
      stepKey="safety"
      title="Let’s check important safety considerations"
      purpose="Most allergies don’t affect vaccination. We check your answers against each vaccine separately, using the official list of reasons to wait or to get advice first."
      onSubmit={submit}
    >
      <Section title="Allergies">
        <TriChoice
          legend="Do you have any known allergies?"
          hint="To foods, medicines, vaccine ingredients or anything else."
          value={form.allergy_triage}
          onChange={(v) => {
            setForm((f) => ({ ...f, allergy_triage: v, allergies: v === 'yes' && !f.allergies.length ? [{ ...emptyAllergy }] : f.allergies }));
          }}
          error={errors.allergy_triage}
        />
        {form.allergy_triage === 'unsure' && (
          <Notice tone="caution">
            That’s fine. Where an allergy could matter for a vaccine, we’ll suggest checking with a professional first.
          </Notice>
        )}
        {form.allergy_triage === 'yes' && (
          <div className="space-y-4">
            {form.allergies.map((a, i) => (
              <fieldset key={i} className="space-y-4 rounded-md border border-rule bg-paper-2 p-4">
                <legend className="px-1 text-sm font-semibold">Allergy {i + 1}</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Type"
                    placeholder="Choose…"
                    options={catalog.allergyCategories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
                    value={a.category}
                    onChange={(e) => setList('allergies', i, { category: e.target.value })}
                  />
                  <SelectField
                    label="Allergic to"
                    placeholder="Choose…"
                    options={catalog.allergySubstances.map((x) => ({ value: x.code, label: x.label }))}
                    value={a.substance}
                    onChange={(e) => setList('allergies', i, { substance: e.target.value })}
                  />
                </div>
                {a.substance === 'other' && (
                  <TextField
                    label="What are you allergic to?"
                    maxLength={80}
                    value={a.substance_other}
                    onChange={(e) => setList('allergies', i, { substance_other: e.target.value })}
                  />
                )}
                <ChoiceGroup
                  legend="How severe was the reaction?"
                  options={SEVERITY}
                  value={a.severity}
                  onChange={(v) => setList('allergies', i, { severity: v })}
                />
                {a.severity === 'anaphylaxis' && (
                  <p className="flex items-start gap-2 text-sm font-medium text-stop">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    Severe allergy noted. We’ll check whether it matters for each vaccine separately.
                  </p>
                )}
                {errors[`allergy-${i}`] && <p className="text-sm text-stop">{errors[`allergy-${i}`]}</p>}
                <Button variant="quiet" onClick={() => removeItem('allergies', i)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove this allergy
                </Button>
              </fieldset>
            ))}
            <Button variant="secondary" onClick={() => addItem('allergies', emptyAllergy)}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add another allergy
            </Button>
          </div>
        )}
      </Section>

      <Section title="Past reactions to vaccines">
        <TriChoice
          legend="Have you ever had a serious reaction after a vaccine?"
          hint="Such as a severe allergic reaction, or a problem a doctor linked to a vaccine. A sore arm or mild fever doesn’t count."
          value={form.reaction_triage}
          onChange={(v) =>
            setForm((f) => ({ ...f, reaction_triage: v, reactions: v === 'yes' && !f.reactions.length ? [{ ...emptyReaction }] : f.reactions }))
          }
          error={errors.reaction_triage}
        />
        {form.reaction_triage === 'yes' && (
          <div className="space-y-4">
            {form.reactions.map((r, i) => (
              <fieldset key={i} className="space-y-4 rounded-md border border-rule bg-paper-2 p-4">
                <legend className="px-1 text-sm font-semibold">Reaction {i + 1}</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="After which vaccine?"
                    placeholder="Choose…"
                    options={vaccineOptions}
                    value={r.vaccine_id}
                    onChange={(e) => setList('reactions', i, { vaccine_id: e.target.value })}
                  />
                  <SelectField
                    label="What happened?"
                    placeholder="Choose…"
                    options={catalog.reactionKinds.map((k) => ({ value: k.code, label: k.label }))}
                    value={r.kind}
                    onChange={(e) => setList('reactions', i, { kind: e.target.value })}
                  />
                </div>
                {errors[`reaction-${i}`] && <p className="text-sm text-stop">{errors[`reaction-${i}`]}</p>}
                <Button variant="quiet" onClick={() => removeItem('reactions', i)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove this reaction
                </Button>
              </fieldset>
            ))}
            <Button variant="secondary" onClick={() => addItem('reactions', emptyReaction)}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add another reaction
            </Button>
          </div>
        )}
      </Section>

      <Section
        title="Right now and recently"
        description="Some of these are reasons to wait, or to check with a professional, for particular vaccines."
      >
        {catalog.safetyQuestions.map((q) => (
          <TriChoice
            key={q.code}
            legend={q.label}
            value={form.answers[q.code]}
            onChange={(v) => setForm((f) => ({ ...f, answers: { ...f.answers, [q.code]: v } }))}
            error={errors[q.code]}
          />
        ))}
        <Why>
          An answer here doesn’t mean you can’t be vaccinated. It tells us which vaccines need a professional’s check first.
        </Why>
      </Section>
    </StepFrame>
  );
}
