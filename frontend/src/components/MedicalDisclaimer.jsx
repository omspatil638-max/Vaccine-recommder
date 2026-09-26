import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function MedicalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-xs text-amber-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Clinical Support Only:</strong> This tool provides informational awareness based on published guidelines. It does NOT provide autonomous medical diagnosis or prescriptions. Professional verification required.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-900 text-sm md:text-base">
            Medical Disclaimer & Clinical Decision Support Notice
          </h4>
          <p className="text-xs md:text-sm text-amber-800 mt-1 leading-relaxed">
            This Personalized Vaccine Suggestion and Immunization Tracking System generates recommendations derived strictly from versioned, published clinical vaccination guidelines (e.g., CDC ACIP, WHO SAGE). 
          </p>
          <div className="mt-2 text-xs text-amber-900 flex flex-wrap gap-x-4 gap-y-1 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Not Autonomous Medical Advice
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Requires Healthcare Professional Review
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Synthetic / Non-PII Data Only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
