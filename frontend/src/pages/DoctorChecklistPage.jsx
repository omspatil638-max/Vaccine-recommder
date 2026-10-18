import React, { useState } from 'react';
import { 
  ClipboardList, 
  CheckSquare, 
  Square, 
  Copy, 
  Printer, 
  RotateCcw, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function DoctorChecklistPage() {
  const defaultQuestions = [
    {
      id: 'q1',
      category: 'Relevance & Eligibility',
      text: 'Which adult vaccines are specifically relevant to my age, lifestyle, and health conditions?',
      selected: true
    },
    {
      id: 'q2',
      category: 'Records & Serology',
      text: 'My childhood vaccination records are unavailable or uncertain. Should we order antibody blood tests (e.g. Hepatitis B titer) before deciding?',
      selected: true
    },
    {
      id: 'q3',
      category: 'Boosters & Intervals',
      text: 'Am I due for a 10-year Tetanus / Tdap booster, or an annual seasonal influenza vaccine?',
      selected: true
    },
    {
      id: 'q4',
      category: 'Chronic Conditions & Safety',
      text: 'Are there any specific precautions or contraindications based on my existing medical conditions or current medications?',
      selected: true
    },
    {
      id: 'q5',
      category: 'Side Effects & Aftercare',
      text: 'What mild or temporary side effects should I anticipate, and how should I manage them at home?',
      selected: true
    },
    {
      id: 'q6',
      category: 'Access & Administration',
      text: 'Where can I receive this vaccine (clinic, hospital, or government immunization center), and what is the approximate cost?',
      selected: false
    },
    {
      id: 'q7',
      category: 'Follow-Up Doses',
      text: 'Does this vaccine require a multi-dose series (e.g. 2 doses for Shingles, 3 doses for Hep B), and when is my next appointment?',
      selected: true
    },
    {
      id: 'q8',
      category: 'Official Documentation',
      text: 'Is there an official patient leaflet or MoHFW/WHO educational brochure I can read afterward?',
      selected: false
    }
  ];

  const [questions, setQuestions] = useState(defaultQuestions);
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  const toggleQuestion = (id) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q))
    );
  };

  const selectAll = () => {
    setQuestions((prev) => prev.map((q) => ({ ...q, selected: true })));
  };

  const deselectAll = () => {
    setQuestions((prev) => prev.map((q) => ({ ...q, selected: false })));
  };

  const handleReset = () => {
    setQuestions(defaultQuestions);
    setCustomNote('');
  };

  const selectedCount = questions.filter((q) => q.selected).length;

  const handleCopy = () => {
    const selectedTexts = questions
      .filter((q) => q.selected)
      .map((q, idx) => `${idx + 1}. [ ] ${q.text} (${q.category})`);

    const output = [
      'SmartVax India — Doctor Visit Checklist for Adult Immunization',
      '==============================================================',
      ...selectedTexts,
      customNote.trim() ? `\nMy Personal Notes / Symptoms:\n${customNote.trim()}` : '',
      '\nPrepared for review with a licensed medical practitioner (MBBS/MD).'
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Doctor Visit Checklist' }]} />
      <MedicalDisclaimer compact />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
            Patient Preparation Tool
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Doctor Visit Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Select, customize, copy, or print questions to ask during your consultation with your doctor.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : `Copy Selected (${selectedCount})`}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Clean Checklist</span>
          </button>
        </div>
      </div>

      {/* Selection Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-600">
          <strong>{selectedCount}</strong> of {questions.length} questions selected for your visit.
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="text-blue-700 hover:text-blue-900 font-bold"
          >
            Select All
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={deselectAll}
            className="text-slate-500 hover:text-slate-800 font-medium"
          >
            Deselect All
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Checklist Items Container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3" id="printable-checklist">
        <div className="border-b pb-3 mb-4 hidden print:block">
          <h2 className="text-xl font-bold text-slate-900">
            SmartVax India — Adult Immunization Consultation Checklist
          </h2>
          <p className="text-xs text-slate-500">
            Discuss these points with your doctor (MBBS/MD).
          </p>
        </div>

        {questions.map((q) => (
          <div
            key={q.id}
            onClick={() => toggleQuestion(q.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              q.selected
                ? 'bg-blue-50/60 border-blue-400 text-slate-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="mt-0.5 shrink-0 text-blue-600">
              {q.selected ? (
                <CheckSquare className="w-5 h-5 text-blue-600 fill-blue-100" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded">
                {q.category}
              </span>
              <p className={`text-xs sm:text-sm font-medium mt-1 leading-relaxed ${q.selected ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                {q.text}
              </p>
            </div>
          </div>
        ))}

        {/* Custom Personal Notes Section */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Add Your Personal Notes, Symptoms, or Recent Medication Names:
          </label>
          <textarea
            rows="3"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Taking metformin for diabetes; received tetanus shot 5 years ago after a bike fall; mild penicillin allergy..."
            className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Helpful Tips on Speaking with Your Doctor */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          Tips for an Effective Clinical Conversation in India
        </h3>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
          <li><strong>Bring current prescriptions:</strong> If you take steroids, immunosuppressants, or diabetes medicines, show them to your doctor so they can select the appropriate vaccine formulation.</li>
          <li><strong>Disclose pregnancy or conception plans:</strong> Always tell your doctor if you are pregnant, breastfeeding, or planning a pregnancy, so live vaccines can be scheduled safely.</li>
          <li><strong>Ask for a written immunization log:</strong> Request that your doctor note any administered vaccines in your hospital booklet or digital health ID (ABHA) for future reference.</li>
        </ul>
      </div>
    </div>
  );
}
