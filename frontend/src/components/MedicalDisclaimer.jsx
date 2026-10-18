import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export default function MedicalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-50/90 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs text-amber-900 mb-4 flex items-center gap-2 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Educational Awareness Notice:</strong> This website provides informational decision support based on Indian guidelines (MoHFW, API, WHO). It does not provide medical diagnosis, prescription, or individual clinical eligibility. Always consult a qualified healthcare professional.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-xl p-4 md:p-5 mb-6 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="text-sm text-amber-950">
          <h4 className="font-bold text-base text-amber-900 flex items-center gap-2">
            Important Medical Information & Clinical Guidance Disclaimer
          </h4>
          <p className="mt-1 leading-relaxed text-amber-900/90 text-xs md:text-sm">
            <strong>SmartVax</strong> is designed to build awareness regarding adult vaccination in India. The educational topics and guideline summaries provided here are derived from verified publications of the <strong>Ministry of Health and Family Welfare (MoHFW)</strong>, <strong>Association of Physicians of India (API)</strong>, and <strong>World Health Organization (WHO) India</strong>.
          </p>
          <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex flex-wrap gap-y-1.5 gap-x-4 text-xs font-semibold text-amber-900">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Not Autonomous Medical Advice or Prescription
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Requires Doctor / Clinician Consultation
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Client-Side Privacy (Zero Health Data Stored)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
