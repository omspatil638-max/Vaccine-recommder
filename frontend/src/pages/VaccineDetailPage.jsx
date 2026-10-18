import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ClipboardList, 
  BookOpen, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import vaccinesData from '../data/vaccines.json';

export default function VaccineDetailPage() {
  const { id } = useParams();
  const vaccine = vaccinesData.find((v) => v.id === id);

  // If invalid ID
  if (!vaccine) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Vaccine Library', to: '/vaccine-library' },
            { label: 'Vaccine Not Found' }
          ]}
        />
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-12">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">
            Vaccine Record Not Found
          </h1>
          <p className="text-xs text-slate-600">
            The vaccine identifier <code>"{id}"</code> could not be found in our verified Indian guideline catalog.
          </p>
          <div className="pt-2">
            <Link
              to="/vaccine-library"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Vaccine Library</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Vaccine Library', to: '/vaccine-library' },
          { label: vaccine.name }
        ]}
      />
      <MedicalDisclaimer compact />

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            to="/vaccine-library"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Vaccine Library</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              {vaccine.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {vaccine.verificationStatus}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {vaccine.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-mono mt-1">
            {vaccine.genericName}
          </p>
        </div>

        {/* Action button row */}
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to="/doctor-checklist"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Add to Doctor Visit Checklist</span>
          </Link>
          <Link
            to="/awareness-guide"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors border border-slate-200"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Check Your Circumstances in Guide</span>
          </Link>
        </div>
      </div>

      {/* Structured Clinical Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prevention */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              What It Helps Prevent
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {vaccine.prevention}
            </p>
          </div>

          {/* Who May Benefit */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Who May Benefit in India
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {vaccine.whoMayBenefit}
            </p>
          </div>

          {/* Age & Risk Considerations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Relevant Age & Health Considerations
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <div>
                <strong className="text-slate-900">Age Bracket Details: </strong>
                {vaccine.ageConsiderations}
              </div>
              <div>
                <strong className="text-slate-900">Clinical Risk Factors: </strong>
                {vaccine.riskConsiderations}
              </div>
            </div>
          </div>

          {/* Previous Vaccination & Dose History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Previous Vaccination & Dose Considerations
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {vaccine.previousVaccination}
            </p>
            <p className="text-[11px] text-slate-500 italic mt-1">
              Note: If your past vaccination records are missing or unknown, consult your doctor. Do not assume you missed doses; blood antibody titer tests or risk-adjusted schedules are available.
            </p>
          </div>

          {/* Common Side Effects */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Expected Common Side Effects
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {vaccine.commonSideEffects}
            </p>
            <p className="text-[11px] text-slate-500">
              Side effects are typically mild and self-limiting, resolving within 1–3 days.
            </p>
          </div>

          {/* Precautions and Contraindications */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-xs space-y-2">
            <h2 className="text-base font-bold text-rose-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Important Precautions & Contraindications
            </h2>
            <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
              {vaccine.precautions}
            </p>
            <p className="text-[11px] text-rose-800/80 font-medium pt-1">
              Always disclose all known allergies, active fevers, current medications, or pregnancy status to your healthcare provider prior to receiving any vaccine.
            </p>
          </div>
        </div>

        {/* Right Sidebar (1 col): Metadata, Sources, Doctor Checklist Prompt */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verification & Metadata
            </h3>
            <div className="text-xs text-slate-700 space-y-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Last Reviewed:</span>
                <span className="font-semibold text-slate-800">{vaccine.lastReviewed}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Verification Status:</span>
                <span className="font-semibold text-emerald-700">{vaccine.verificationStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Jurisdiction:</span>
                <span className="font-semibold text-slate-800">Republic of India</span>
              </div>
            </div>
          </div>

          {/* Official Indian Sources Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              Official Guideline Citations
            </h3>
            <ul className="space-y-2 text-xs">
              {(vaccine.officialSources || []).map((source, index) => (
                <li key={index} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-teal-700 hover:text-teal-900 flex items-start gap-1 group"
                  >
                    <span className="leading-snug">{source.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-700 shrink-0 mt-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Checklist Box */}
          <div className="bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-teal-800">
              <ClipboardList className="w-5 h-5 text-teal-700" />
              <h4 className="font-bold text-sm text-slate-900">
                Ready to Discuss with Your Doctor?
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use our interactive Doctor Visit Checklist to prepare questions about this vaccine for your next clinical appointment.
            </p>
            <Link
              to="/doctor-checklist"
              className="block w-full text-center py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              Open Interactive Checklist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
