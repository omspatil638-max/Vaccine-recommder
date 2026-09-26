import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Button from '../../components/ui/Button';
import Notice from '../../components/ui/Notice';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/format';
import { useIntake } from './IntakeContext';
import { ChevronLeft } from 'lucide-react';

const TRI = { yes: 'Yes', no: 'No', unsure: 'Not sure' };
const PREG = { pregnant: 'Pregnant', not_pregnant: 'Not pregnant', unsure: 'Not sure', not_applicable: 'Not applicable' };
const SEX = { female: 'Female', male: 'Male', intersex: 'Intersex', prefer_not: 'Prefer not to say' };
const HIST = { received: 'Had it', not_received: 'Haven’t had it', unknown: 'Not sure' };

function ReviewSection({ title, editTo, rows, children }) {
  return (
    <section className="border-t border-rule py-6">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-xl">{title}</h2>
        <Link to={`${editTo}?return=review`} className="inline-flex min-h-11 items-center text-sm">
          Edit<span className="visually-hidden"> {title.toLowerCase()}</span>
        </Link>
      </div>
      {rows && (
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[14rem_minmax(0,1fr)]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-sm text-ink-3">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </section>
  );
}

export default function ReviewStep() {
  const { data, catalog } = useIntake();
  const auth = useAuth();
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const { profile: p, location: l, health: h, history: hist, safety: s, records, guideline } = data;

  const missing = ['profile', 'location', 'health', 'history', 'safety'].filter((k) => !data[k]);
  const conditionLabel = Object.fromEntries(catalog.conditions.map((c) => [c.code, c.label]));
  const substanceLabel = Object.fromEntries(catalog.allergySubstances.map((c) => [c.code, c.label]));
  const reactionLabel = Object.fromEntries(catalog.reactionKinds.map((c) => [c.code, c.label]));
  const vaccines = guideline ? catalog.vaccinesBySet[guideline.id] : [];
  const vaccineName = Object.fromEntries(Object.values(catalog.vaccinesBySet).flat().map((v) => [v.id, v.shortName]));

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      await api.post('/intake/complete');
      await auth.refresh();
      navigate('/recommendations', { replace: true });
    } catch (err) {
      setError(err.message);
      setRunning(false);
    }
  };

  const present = h ? Object.entries(h.conditions).filter(([, v]) => v === 'yes').map(([k]) => conditionLabel[k]) : [];
  const unsureConditions = h ? Object.values(h.conditions).filter((v) => v === 'unsure').length : 0;

  return (
    <div className="pb-24 sm:pb-0">
      <header className="mb-6 space-y-2">
        <h1 className="text-statement">Review your information</h1>
        <p className="prose-measure text-lg text-ink-2">
          This is everything the assessment will use. Check it, change anything that’s wrong, then run the assessment.
        </p>
      </header>

      {missing.length > 0 && (
        <Notice tone="caution" title="Some steps aren’t finished" className="mb-6">
          Please complete: {missing.join(', ')}.
        </Notice>
      )}

      {p && (
        <ReviewSection
          title="About you"
          editTo="/start/profile"
          rows={[
            ['Name', p.full_name],
            ['Date of birth', formatDate(p.birth_date)],
            ['Sex assigned at birth', SEX[p.sex_at_birth]],
            ['Pregnancy', `${PREG[p.pregnancy_status]}${p.pregnancy_weeks ? `, ${p.pregnancy_weeks} weeks` : ''}`],
          ]}
        />
      )}
      {l && (
        <ReviewSection
          title="Location"
          editTo="/start/location"
          rows={[
            ['Country', l.country_name ?? l.country_code],
            ['Area', [l.city, l.region].filter(Boolean).join(', ') || 'Not given'],
            ['Approximate location', l.lat != null ? 'Shared' : 'Not shared'],
            ['Guideline', guideline ? `${guideline.name} (${guideline.version})` : 'None available for this country'],
          ]}
        />
      )}
      {h && (
        <ReviewSection
          title="Health"
          editTo="/start/health"
          rows={[
            ['Conditions', present.length ? present.join(', ') : 'None reported'],
            ['Not sure about', unsureConditions ? `${unsureConditions} condition${unsureConditions > 1 ? 's' : ''}` : 'Nothing'],
            ['Weakened immune system', `${TRI[h.immunocompromised]}${h.immunocompromised === 'yes' ? ` (severe: ${TRI[h.severe_immunodeficiency].toLowerCase()})` : ''}`],
            ['Work in healthcare', TRI[h.healthcare_personnel]],
          ]}
        />
      )}
      {hist && (
        <ReviewSection title="Vaccination history" editTo="/start/history">
          {vaccines.length ? (
            <ul className="divide-y divide-rule">
              {vaccines.map((v) => {
                const doses = records.filter((r) => r.vaccine_id === v.id);
                return (
                  <li key={v.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2">
                    <span>{v.name}</span>
                    <span className="text-ink-2">
                      {HIST[hist.answers[v.id]] ?? 'Not answered'}
                      {doses.length > 0 && <span className="data"> · {doses.length} dose{doses.length > 1 ? 's' : ''}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-ink-2">Not needed for your location.</p>
          )}
        </ReviewSection>
      )}
      {s && (
        <ReviewSection
          title="Allergies and safety"
          editTo="/start/safety"
          rows={[
            [
              'Allergies',
              s.allergy_triage === 'yes'
                ? s.allergies.map((a) => `${a.substance === 'other' ? a.substance_other || 'Other' : substanceLabel[a.substance]} (${a.severity === 'anaphylaxis' ? 'severe' : a.severity === 'non_severe' ? 'not severe' : 'severity unknown'})`).join('; ')
                : TRI[s.allergy_triage],
            ],
            [
              'Past vaccine reactions',
              s.reaction_triage === 'yes'
                ? s.reactions.map((r) => `${reactionLabel[r.kind]} after ${r.vaccine_id === 'unknown' ? 'an unknown vaccine' : vaccineName[r.vaccine_id]}`).join('; ')
                : TRI[s.reaction_triage],
            ],
            [
              'Other safety answers',
              (() => {
                const yes = Object.values(s.answers).filter((v) => v === 'yes').length;
                const unsure = Object.values(s.answers).filter((v) => v === 'unsure').length;
                return yes || unsure ? `${yes} yes, ${unsure} not sure` : 'All no';
              })(),
            ],
          ]}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper px-4 py-3 sm:static sm:mt-6 sm:px-0 sm:pt-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {error && (
            <p role="alert" className="text-sm text-stop">
              {error}
            </p>
          )}
          <Button to="/start/safety" variant="quiet" className="-ml-2 hidden sm:inline-flex">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <Button onClick={run} size="lg" loading={running} loadingLabel="Checking against the guideline…" disabled={missing.length > 0}>
            Run vaccination assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
