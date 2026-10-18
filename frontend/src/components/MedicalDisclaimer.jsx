import React from 'react';
import { Info } from 'lucide-react';

export default function MedicalDisclaimer({ compact = false }) {
  return <aside className={`flex items-start gap-3 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600 ${compact ? '' : 'mt-6'}`} aria-label="Educational information notice">
    <Info className="mt-1 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
    <p><strong className="font-semibold text-slate-800">For education and discussion.</strong> This guide cannot diagnose, prescribe, or determine your individual eligibility. Vaccine decisions depend on your health history and current guidance; discuss them with a qualified healthcare professional.</p>
  </aside>;
}
