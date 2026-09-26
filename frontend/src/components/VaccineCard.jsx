import React from 'react';
import { AlertCircle, CheckCircle, HelpCircle, Clock, ShieldAlert, BookOpen, UserCheck, AlertTriangle } from 'lucide-react';

const STATUS_STYLES = {
  due: {
    bg: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-600 text-white',
    icon: Clock,
    label: 'Due now'
  },
  overdue: {
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-600 text-white',
    icon: AlertCircle,
    label: 'Overdue'
  },
  potentially_due: {
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-600 text-white',
    icon: AlertTriangle,
    label: 'Potentially due'
  },
  completed: {
    bg: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-600 text-white',
    icon: CheckCircle,
    label: 'Completed'
  },
  unknown: {
    bg: 'bg-violet-50 border-violet-200',
    badge: 'bg-violet-600 text-white',
    icon: HelpCircle,
    label: 'Unknown record'
  },
  not_applicable: {
    bg: 'bg-slate-50 border-slate-200',
    badge: 'bg-slate-500 text-white',
    icon: CheckCircle,
    label: 'Not applicable'
  }
};

export default function VaccineCard({ rec }) {
  const style = STATUS_STYLES[rec.status] || STATUS_STYLES.unknown;
  const StatusIcon = style.icon;

  return (
    <div className={`rounded-[24px] border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${style.bg}`}>
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200/80 pb-3 md:flex-row md:items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {rec.category || 'General guidance'}
          </span>
          <h3 className="mt-1 text-lg font-bold text-slate-900 md:text-xl">
            {rec.vaccineName}
            <span className="ml-2 text-[11px] font-mono font-medium text-slate-500">({rec.vaccineId})</span>
          </h3>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${style.badge}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {style.label}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-700">{rec.reason}</p>

          {rec.contraindicationsFlagged && rec.contraindicationsFlagged.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900">
              <div className="mb-1 flex items-center gap-1.5 font-bold">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                Clinical precaution / contraindication
              </div>
              <ul className="list-disc space-y-1 pl-5">
                {rec.contraindicationsFlagged.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {rec.missingInfo && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
              <div className="mb-1 flex items-center gap-1.5 font-bold">
                <HelpCircle className="h-4 w-4 text-violet-600" />
                Missing information
              </div>
              <p>{rec.missingInfo}</p>
            </div>
          )}

          {rec.needsProfessionalReview && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <UserCheck className="mt-0.5 h-4 w-4 text-amber-700" />
                <div>
                  <span className="font-bold">Needs professional review:</span>{' '}
                  <span>{rec.reviewReason || 'Clinical verification required before administration.'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <BookOpen className="mt-0.5 h-4 w-4 text-blue-600" />
            <div>
              <strong className="text-slate-700">Guideline source:</strong> {rec.guidelineSource} ({rec.guidelineVersion})
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500">
            <div className="rounded-md bg-slate-100 px-2 py-1">
              <strong>Rule:</strong> {rec.ruleId}
            </div>
            <div className="mt-2 rounded-md bg-slate-100 px-2 py-1">
              <strong>Reason code:</strong> {rec.reasonCode}
            </div>
          </div>

          {rec.evidenceDetail && (
            <blockquote className="mt-3 border-l-2 border-slate-300 pl-2 italic text-slate-600">
              “{rec.evidenceDetail}”
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}
