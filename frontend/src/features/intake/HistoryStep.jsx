import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ChoiceGroup, TriChoice } from '../../components/ui/Choice';
import Notice from '../../components/ui/Notice';
import { api } from '../../lib/api';
import { formatDate, lcFirst } from '../../lib/format';
import DoseForm from '../records/DoseForm';
import { useIntake } from './IntakeContext';
import StepFrame, { Section, Why } from './StepFrame';
import { useFieldErrors } from '../../lib/useFieldErrors';

const ANSWERS = [
  { value: 'received', label: 'I’ve had it' },
  { value: 'not_received', label: 'I haven’t had it' },
  { value: 'unknown', label: 'Not sure' },
];

function doseLabel(r, products) {
  const date = r.date ? formatDate(r.date, r.date_precision) : 'Date unknown';
  const product = r.product ? products?.[r.vaccine_id]?.[r.product] : null;
  return [r.dose_number ? `Dose ${r.dose_number}` : 'Dose', date, product].filter(Boolean).join(' · ');
}

function VaccineHistory({ vaccine, answer, onAnswer, records, products, onRecordsChanged, error }) {
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);

  const remove = async (id) => {
    setRemoving(id);
    try {
      await api.del(`/intake/records/${id}`);
      await onRecordsChanged();
    } finally {
      setRemoving(null);
    }
  };

  return (
    <li className="space-y-4 border-b border-rule py-6 first:pt-0">
      <ChoiceGroup
        legend={vaccine.name}
        hint={`Protects against ${lcFirst(vaccine.protectsAgainst)}.`}
        options={ANSWERS}
        value={answer}
        onChange={onAnswer}
        error={error}
        inline
      />
      {answer === 'received' && (
        <div className="space-y-3 pl-0 sm:pl-4">
          {records.length > 0 ? (
            <ol className="space-y-2">
              {records.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    <span className="data">{doseLabel(r, products)}</span>
                    {r.data_status === 'USER_REPORTED' && <span className="text-ink-3"> · you reported</span>}
                  </span>
                  <Button
                    variant="quiet"
                    onClick={() => remove(r.id)}
                    loading={removing === r.id}
                    loadingLabel="Removing…"
                    aria-label={`Remove ${doseLabel(r, products)}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </Button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ink-2">
              Add the doses you know about. Without dates, we can’t tell when your next dose is due.
            </p>
          )}
          {adding ? (
            <DoseForm
              fixedVaccine={vaccine.id}
              products={products}
              onCancel={() => setAdding(false)}
              onSaved={async () => {
                setAdding(false);
                await onRecordsChanged();
              }}
            />
          ) : (
            <Button variant="secondary" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add a dose
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

export default function HistoryStep() {
  const { data, catalog, save, reload } = useIntake();
  const setId = data?.guideline?.id;
  const vaccines = (setId && catalog?.vaccinesBySet?.[setId]) || [];
  const isUS = data?.location?.country_code === 'US';
  const hist = data?.history ?? {};
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(vaccines.map((v) => [v.id, hist.answers?.[v.id] ?? ''])),
  );
  const [immunity, setImmunity] = useState({ mmr: hist.immunity?.mmr ?? '', varicella: hist.immunity?.varicella ?? '' });
  const [errors, setErrors] = useFieldErrors(immunity);
  const records = data?.records ?? [];

  const submit = async () => {
    const e = {};
    for (const v of vaccines) if (!answers[v.id]) e[v.id] = 'Choose an answer. “Not sure” is fine.';
    if (isUS && !immunity.mmr) e.mmr = 'Choose an answer.';
    if (isUS && !immunity.varicella) e.varicella = 'Choose an answer.';
    setErrors(e);
    if (Object.keys(e).length) throw new Error('Answer each vaccine. If you don’t know, choose “Not sure”.');
    await save('history', {
      answers: Object.fromEntries(Object.entries(answers).filter(([, v]) => v)),
      immunity: isUS ? immunity : {},
    });
  };

  return (
    <StepFrame
      stepKey="history"
      title="Vaccinations you’ve had"
      purpose="Tell us what you know. If you’re not sure, say so: we won’t assume you’ve never had a vaccine."
      onSubmit={submit}
    >
      {vaccines.length === 0 ? (
        <Notice tone="info" title="Nothing to add for your country">
          We don’t assess vaccinations for your location yet, so there’s no history to record here. You can continue.
        </Notice>
      ) : (
        <>
          <Section>
            <Why>
              Your vaccination card, a pharmacy record or a GP record can help. You can come back and add doses at any time.
            </Why>
            <ul>
              {vaccines.map((v) => (
                <VaccineHistory
                  key={v.id}
                  vaccine={v}
                  answer={answers[v.id]}
                  error={errors[v.id]}
                  onAnswer={(val) => setAnswers((a) => ({ ...a, [v.id]: val }))}
                  records={records.filter((r) => r.vaccine_id === v.id)}
                  products={catalog.products}
                  onRecordsChanged={async () => {
                    await reload();
                    setAnswers((a) => ({ ...a, [v.id]: 'received' }));
                  }}
                />
              ))}
            </ul>
          </Section>

          {isUS && (
            <Section title="Evidence of immunity" description="A blood test or diagnosis can count instead of vaccine records.">
              <TriChoice
                legend="Has a healthcare professional or a blood test confirmed you’re immune to measles, mumps and rubella?"
                value={immunity.mmr}
                onChange={(v) => setImmunity((i) => ({ ...i, mmr: v }))}
                error={errors.mmr}
              />
              <TriChoice
                legend="Has a healthcare professional diagnosed you with chickenpox or shingles, or a blood test shown you’re immune?"
                value={immunity.varicella}
                onChange={(v) => setImmunity((i) => ({ ...i, varicella: v }))}
                error={errors.varicella}
              />
            </Section>
          )}
        </>
      )}
    </StepFrame>
  );
}
