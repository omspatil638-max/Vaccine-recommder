import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Copy, 
  Check, 
  Printer, 
  AlertCircle, 
  ShieldCheck, 
  BookOpen, 
  FileText,
  User,
  HeartPulse,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { evaluateQuestionnaire } from '../data/educationalRules';

export default function AwarenessGuidePage() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  // Form state (temporary in-memory only — never transmitted to server)
  const [answers, setAnswers] = useState({
    ageGroup: '',
    conditions: [],
    historyStatus: 'unknown',
    genderConsideration: 'none',
    topics: []
  });

  const [submitted, setSubmitted] = useState(false);

  const handleConditionToggle = (conditionId) => {
    setAnswers((prev) => {
      const current = prev.conditions;
      if (current.includes(conditionId)) {
        return { ...prev, conditions: current.filter((c) => c !== conditionId) };
      } else {
        return { ...prev, conditions: [...current, conditionId] };
      }
    });
  };

  const handleTopicToggle = (topicId) => {
    setAnswers((prev) => {
      const current = prev.topics;
      if (current.includes(topicId)) {
        return { ...prev, topics: current.filter((t) => t !== topicId) };
      } else {
        return { ...prev, topics: [...current, topicId] };
      }
    });
  };

  const matchedRules = submitted ? evaluateQuestionnaire(answers) : [];

  const handleRetake = () => {
    setSubmitted(false);
    setStep(1);
    setAnswers({
      ageGroup: '',
      conditions: [],
      historyStatus: 'unknown',
      genderConsideration: 'none',
      topics: []
    });
  };

  const handleCopySummary = () => {
    const summaryLines = [
      'SmartVax India — Adult Immunization Discussion Summary',
      '-------------------------------------------------------',
      `Age Bracket: ${answers.ageGroup}`,
      `Health Circumstances: ${answers.conditions.length > 0 ? answers.conditions.join(', ') : 'None selected'}`,
      `Vaccination History Status: ${answers.historyStatus}`,
      '',
      'Educational Topics to Discuss with Healthcare Professional:',
      ...matchedRules.map(
        (r, i) => `${i + 1}. ${r.title} (${r.targetVaccineName})\n   - Reason: ${r.whyShown}`
      ),
      '',
      'Important Notice: This summary is for educational discussion support. Please review with an MBBS/MD doctor before receiving any vaccine.'
    ];

    navigator.clipboard.writeText(summaryLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Awareness Guide' }]} />
      <MedicalDisclaimer compact />

      {/* Intro Header */}
      {!submitted ? (
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
            Private Interactive Questionnaire
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Adult Immunization Awareness Guide
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Answer a few general questions to organize topics you may wish to discuss with your doctor.
          </p>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>Zero Data Collection:</strong> We do NOT ask for your name, phone, or address. All evaluations run locally inside your browser and vanish upon closing.
            </span>
          </div>
        </div>
      ) : null}

      {/* Questionnaire Form Steps */}
      {!submitted ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-3xl">
          {/* Progress Indicator */}
              <div className="flex items-center justify-between border-b pb-4" aria-label={`Progress: step ${step} of 4`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Step {step} of 4
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    s <= step ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Age Group */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  What is your age bracket?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Why we ask: Recommendations change across life stages (e.g. shingles and pneumococcal vaccines are prioritized starting at ages 50 and 65 in India).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: '18-29', label: '18–29 Years', desc: 'Young Adulthood & College/Career' },
                  { id: '30-49', label: '30–49 Years', desc: 'Middle Adulthood & Family Care' },
                  { id: '50-64', label: '50–64 Years', desc: 'Pre-Seniors (Shingles & Pneumo Priority)' },
                  { id: '65+', label: '65 Years and Older', desc: 'Seniors (Universal Pneumococcal & Flu)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAnswers({ ...answers, ageGroup: opt.id })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      answers.ageGroup === opt.id
                        ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Health Conditions */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-blue-600" />
                  Do you live with any chronic health conditions?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Why we ask: In India, chronic conditions like diabetes and lung diseases significantly increase vulnerability to pneumonia, flu complications, and hepatitis. (Select all that apply, or skip if none).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'diabetes', label: 'Diabetes Mellitus', desc: 'Type 1 or Type 2 Diabetes' },
                  { id: 'respiratory', label: 'Asthma / COPD / Lung Condition', desc: 'Chronic airway disease or post-TB' },
                  { id: 'cardiovascular', label: 'Heart Disease / Hypertension', desc: 'Coronary artery disease, heart failure' },
                  { id: 'kidney', label: 'Chronic Kidney Disease', desc: 'Nephropathy or Hemodialysis' },
                  { id: 'pregnancy', label: 'Currently Pregnant / Planning', desc: 'Specialized maternity considerations' },
                  { id: 'animal_contact', label: 'Frequent Animal Contact', desc: 'Veterinary, pet shelter, or outdoor exposure' }
                ].map((c) => {
                  const selected = answers.conditions.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleConditionToggle(c.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selected
                          ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{c.label}</span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Vaccination History */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  What is the status of your past vaccination records?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Why we ask: Many adults in India have missing paper records. An unknown history is treated safely as "record unavailable," not as a missed dose.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  {
                    id: 'unknown',
                    label: 'Unknown / Records Unavailable (Extremely Common)',
                    desc: 'I do not have my childhood card and cannot verify past shots. Your doctor can order antibody titers or recommend safe routine adult boosters.'
                  },
                  {
                    id: 'booster_due',
                    label: 'Received Childhood Vaccines, But No Boosters in 10+ Years',
                    desc: 'Childhood shots were completed, but tetanus/Tdap or adult boosters have not been updated.'
                  },
                  {
                    id: 'up_to_date',
                    label: 'I Have Verified Records and Recent Boosters',
                    desc: 'My vaccination documentation is accessible and up to date.'
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAnswers({ ...answers, historyStatus: opt.id })}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      answers.historyStatus === opt.id
                        ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Specific Topics of Interest */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Any specific areas you would like to explore?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Optional: Choose any specific topics you want included in your doctor discussion summary.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'cancer_prevention', label: 'Cancer Prevention (HPV & Hepatitis B)' },
                  { id: 'animal_bites', label: 'Rabies Awareness & Animal Bite Safety' },
                  { id: 'family_protection', label: 'Protecting Newborns & Elders at Home' },
                  { id: 'travel', label: 'Travel Immunization (Typhoid & Regional)' }
                ].map((t) => {
                  const selected = answers.topics.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTopicToggle(t.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{t.label}</span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !answers.ageGroup}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Generate Discussion Guide
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8 max-w-4xl" id="printable-summary">
          {/* Action Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-blue-100 text-blue-800">
                  Customized Clinical Discussion Guide
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Your Doctor Discussion Summary
                </h2>
                <p className="text-xs text-slate-500">
                  Generated by SmartVax deterministic rules based on your selected circumstances.
                </p>
              </div>

              {/* Action Buttons: Copy & Print */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Summary</span>
                </button>
                <button
                  onClick={handleRetake}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Retake Questionnaire"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Selected Circumstances Snapshot */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Age Group:</span>
                <strong className="text-slate-900">{answers.ageGroup} Years</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Health Conditions:</span>
                <strong className="text-slate-900">
                  {answers.conditions.length > 0 ? answers.conditions.join(', ') : 'None indicated'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Vaccination Records:</span>
                <strong className="text-slate-900">
                  {answers.historyStatus === 'unknown' ? 'Unknown / Unavailable' : answers.historyStatus}
                </strong>
              </div>
            </div>
          </div>

          {/* Educational Topics Matched */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Topics to Ask Your Doctor ({matchedRules.length} Matched Rules)
            </h3>

            {matchedRules.length === 0 ? (
              <div className="bg-white border rounded-2xl p-8 text-center text-slate-500">
                <p className="text-sm font-semibold">No specific extra topics triggered based on your answers.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Routine adult vaccination (such as Tdap 10-year booster and annual flu shot) is still worth confirming with your doctor.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">
                          {rule.title}
                        </span>
                        <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-mono">
                          {rule.targetVaccineName}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                        {rule.verificationStatus}
                      </span>
                    </div>

                    {/* Why Shown Explanation */}
                    <div className="bg-blue-50/70 border-l-3 border-blue-500 p-3 rounded-r-xl text-xs text-blue-950">
                      <strong>Why this topic appears: </strong>
                      {rule.whyShown}
                    </div>

                    {/* Specific Doctor Discussion Points */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Suggested Questions to Ask at Your Visit:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {rule.discussionPoints.map((dp, idx) => (
                          <li key={idx}>{dp}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Source Citation */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-100">
                      <span>
                        Guideline Reference: <strong>{rule.verifiedSource}</strong>
                      </span>
                      <Link
                        to={`/vaccine-library/${rule.targetVaccineId}`}
                        className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <span>View vaccine details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Questionnaire Again</span>
            </button>
            <Link
              to="/doctor-checklist"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Continue to Interactive Doctor Visit Checklist
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
