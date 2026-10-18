import React from 'react';
import { Shield, Lock, FileCode, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <MedicalDisclaimer />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Privacy, Safety Architecture & Clinical Disclaimer
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            System architectural guarantees, privacy principles, and safety boundaries.
          </p>
        </div>

        {/* 1. Zero PII Commitment */}
        <div className="border-t pt-6">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            1. Zero Real PII / PHI Policy
          </h3>
          <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
            This system operates exclusively using synthetic, mock, or de-identified test datasets. No real Personally Identifiable Information (PII) or Protected Health Information (PHI) is collected, stored, or processed. The system is designed for deployment on zero-cost infrastructure (e.g., Vercel free tier) without paid third-party data tracking.
          </p>
        </div>

        {/* 2. Deterministic Rule Engine Architecture */}
        <div className="border-t pt-6">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            2. Deterministic Rule Engine vs ML / LLM Usage
          </h3>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-3">
{`Structured user data
        |
        v
Validation and normalization
        |
        v
Deterministic guideline/rule engine (source of truth)
        |
        v
Recommendation results with reasons and evidence
        |
        +--> Optional LLM explanation layer (explains only, never decides)
        |
        v
User dashboard and professional review`}
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-xs md:text-sm text-gray-700">
            <li><strong>Rule Engine Authority:</strong> Vaccine eligibility, catch-up schedules, and contraindications are decided 100% deterministically by published MoHFW / NTAGI / API / WHO India rulesets.</li>
            <li><strong>LLM Boundary:</strong> Any LLM layer strictly acts as a natural-language explainer of pre-computed rule engine results. An LLM is NEVER allowed to make clinical decisions or infer eligibility.</li>
            <li><strong>No Hallucinations:</strong> Recommendations strictly cite specific guideline versions (e.g. API Adult Immunization 2026.1) and rule IDs.</li>
          </ul>
        </div>

        {/* 3. Safe Handling of Incomplete / Missing Data */}
        <div className="border-t pt-6">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            3. Explicit Handling of Missing Data
          </h3>
          <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
            In accordance with clinical safety principles, missing or incomplete vaccination history is NEVER silently assumed to be negative ("not vaccinated"). Instead, missing data is explicitly flagged as:
          </p>
          <div className="bg-purple-50 border-l-4 border-purple-600 p-3 rounded text-xs text-purple-900 font-bold my-2">
            "Unknown — vaccination record unavailable"
          </div>
          <p className="text-xs text-gray-600">
            This forces a mandatory professional review before any vaccine is ordered or administered.
          </p>
        </div>

        {/* 4. Medical Disclaimer */}
        <div className="border-t pt-6">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            4. Clinical Decision Support Disclaimer
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            This software is intended as an informational clinical decision-support tool. It does NOT provide formal medical diagnosis, treatment plans, or autonomous medical prescriptions. Patients must consult with a licensed physician, pharmacist, or qualified healthcare provider before receiving any vaccination.
          </p>
        </div>
      </div>
    </div>
  );
}
