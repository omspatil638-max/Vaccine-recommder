import React, { useState } from 'react';
import { LayoutDashboard, Filter, CheckCircle2, UserCheck, ShieldCheck, ArrowRight, Clock3, Stethoscope, AlertTriangle } from 'lucide-react';
import VaccineCard from '../components/VaccineCard';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function DashboardPage({ profile, recommendations, reviewStatus, onTabChange }) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRecs = recommendations.filter((rec) => {
    if (filterStatus === 'all') return true;
    return rec.status === filterStatus;
  });

  const dueCount = recommendations.filter((r) => r.status === 'due').length;
  const overdueCount = recommendations.filter((r) => r.status === 'overdue').length;
  const potDueCount = recommendations.filter((r) => r.status === 'potentially_due').length;
  const unknownCount = recommendations.filter((r) => r.status === 'unknown').length;
  const reviewRequiredCount = recommendations.filter((r) => r.needsProfessionalReview).length;

  const nextActions = [
    dueCount > 0 ? `${dueCount} vaccine${dueCount > 1 ? 's are' : ' is'} ready to review now` : 'No urgent vaccines to review',
    overdueCount > 0 ? `${overdueCount} overdue item${overdueCount > 1 ? 's need' : ' needs'} attention` : 'No overdue items',
    reviewRequiredCount > 0 ? `${reviewRequiredCount} recommendation${reviewRequiredCount > 1 ? 's' : ''} need clinician review` : 'No clinician follow-up needed',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
      <MedicalDisclaimer />

      <section className="hero-panel mb-8 overflow-hidden rounded-[30px] border border-blue-100/80 text-white shadow-[0_30px_90px_rgba(59,130,246,0.18)]">
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">
                  Active profile
                </span>
                <span className="demo-badge dark">Demo data</span>
                <span className="font-mono text-[11px] text-slate-300">{profile.id}</span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold md:text-4xl">{profile.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">
                {profile.age} yrs &bull; {profile.sex?.toUpperCase()} &bull; {profile.country} &bull;{' '}
                {profile.pregnancyStatus && profile.pregnancyStatus !== 'not_pregnant'
                  ? `Pregnancy: ${profile.pregnancyStatus.replace('_', ' ')}`
                  : 'Not pregnant'} &bull; {profile.occupation?.replace('_', ' ')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => onTabChange('profile')}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Edit profile
              </button>
              <button
                onClick={() => onTabChange('review')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-blue-900/20 transition hover:bg-slate-100"
              >
                <UserCheck className="w-4 h-4" />
                Review
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.7fr_0.9fr]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { label: 'Due now', value: dueCount, tone: 'text-blue-200' },
                  { label: 'Overdue', value: overdueCount, tone: 'text-red-200' },
                  { label: 'Potential', value: potDueCount, tone: 'text-amber-200' },
                  { label: 'Unknown', value: unknownCount, tone: 'text-violet-200' },
                  { label: 'Review', value: reviewRequiredCount, tone: 'text-emerald-200' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-slate-300">{item.label}</div>
                    <div className={`mt-1 text-2xl font-extrabold ${item.tone}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Key actions
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {nextActions.map((action) => (
                  <li key={action} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-300" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {reviewStatus && reviewStatus.reviewed && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-emerald-900">Clinically verified</span>
                <span className="text-xs text-emerald-700">{reviewStatus.reviewedAt}</span>
              </div>
              <p className="mt-1 text-xs text-emerald-800">
                Reviewed by <strong>{reviewStatus.reviewedBy}</strong>
              </p>
              <p className="mt-2 rounded-xl bg-emerald-100/80 p-2 text-xs italic text-emerald-900">
                “{reviewStatus.notes}”
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <LayoutDashboard className="h-5 w-5 text-blue-600" />
            Vaccine recommendation overview
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Recommendations are derived from clinical rules and review-ready safety logic.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-sm">
          <span className="mr-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'due', label: 'Due' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'potentially_due', label: 'Potentially due' },
            { id: 'unknown', label: 'Unknown' },
            { id: 'completed', label: 'Completed' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filterStatus === f.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredRecs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-500 shadow-sm">
          <div className="mb-2 inline-flex rounded-full bg-slate-100 p-3 text-slate-500">
            <Clock3 className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold">No vaccines match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec) => (
            <VaccineCard key={rec.vaccineId} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
