import React, { useState } from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, XCircle, Edit3, MessageSquare, Save, AlertTriangle, FileText } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function ReviewPage({ profile, historyList, recommendations, reviewStatus, onSaveReview }) {
  const [providerName, setProviderName] = useState(reviewStatus?.reviewedBy || '');
  const [reviewNotes, setReviewNotes] = useState(reviewStatus?.notes || '');
  const [overrides, setOverrides] = useState(reviewStatus?.overrides || {});
  const [isSigned, setIsSigned] = useState(reviewStatus?.reviewed || false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleOverrideChange = (vaccineId, action, note) => {
    setOverrides((prev) => ({
      ...prev,
      [vaccineId]: { action, note: note || prev[vaccineId]?.note || '' }
    }));
  };

  const handleSignOff = (e) => {
    e.preventDefault();
    const updatedReview = {
      reviewed: true,
      reviewedBy: providerName,
      reviewedAt: new Date().toLocaleString(),
      notes: reviewNotes,
      overrides: overrides
    };
    onSaveReview(updatedReview);
    setIsSigned(true);
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <MedicalDisclaimer compact />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase">
                Clinical Review Workspace
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-600" />
              Healthcare Professional Verification
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Review rule-based recommendations, verify clinical safety parameters, and issue professional sign-off.
            </p>
          </div>
          {isSigned && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Signed & Verified
            </span>
          )}
        </div>

        {showSavedMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Clinical verification saved and signed into audit log!
          </div>
        )}

        {/* Patient Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Patient Clinical Baseline Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-800">
            <div>
              <strong>Patient:</strong> {profile.name} ({profile.id})
            </div>
            <div>
              <strong>Age / Sex:</strong> {profile.age} Yrs &bull; {profile.sex}
            </div>
            <div>
              <strong>Pregnancy Status:</strong> {profile.pregnancyStatus || 'Not Pregnant'}
            </div>
            <div>
              <strong>Medical Conditions:</strong>{' '}
              {(profile.medicalConditions || []).join(', ') || 'None reported'}
            </div>
            <div>
              <strong>Immunocompromised:</strong>{' '}
              {profile.immunocompromised ? 'YES (High Risk)' : 'NO'}
            </div>
            <div>
              <strong>Known Allergies:</strong>{' '}
              {(profile.allergies || []).join(', ') || 'None reported'}
            </div>
          </div>
        </div>

        {/* Recommendations Review Table */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Evaluated Recommendations & Rule Logic
          </h3>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const currentOverride = overrides[rec.vaccineId] || { action: 'APPROVED', note: '' };
              return (
                <div key={rec.vaccineId} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 mb-3">
                    <div>
                      <span className="text-xs font-bold text-gray-800">{rec.vaccineName}</span>
                      <span className="text-xs text-gray-500 font-mono ml-2">({rec.vaccineId})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-medium">
                        Engine Status: {rec.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 mb-2">
                    <strong>Rule Reason:</strong> {rec.reason}
                  </p>

                  <div className="text-[11px] text-gray-500 font-mono bg-white p-2 rounded border mb-3">
                    Guideline: {rec.guidelineSource} (v{rec.guidelineVersion}) | Rule: {rec.ruleId}
                  </div>

                  {/* Clinician Action Inputs */}
                  <div className="bg-white border rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Clinician Action</label>
                      <select
                        value={currentOverride.action}
                        onChange={(e) => handleOverrideChange(rec.vaccineId, e.target.value, currentOverride.note)}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="APPROVED">APPROVE (Accept Rule Engine Result)</option>
                        <option value="MODIFIED">MODIFY (Adjust dose timing / formulation)</option>
                        <option value="DEFERRED">DEFER (Postpone administration)</option>
                        <option value="REJECTED">REJECT (Not clinically appropriate)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Clinician Justification / Order Note</label>
                      <input
                        type="text"
                        placeholder="Add rationale if modifying or deferring..."
                        value={currentOverride.note}
                        onChange={(e) => handleOverrideChange(rec.vaccineId, currentOverride.action, e.target.value)}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinician Sign-Off Form */}
        <form onSubmit={handleSignOff} className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-700" />
            Healthcare Professional Sign-Off & Verification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reviewing Clinician Name & License</label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Overall Consultation Summary Note</label>
              <input
                type="text"
                placeholder="e.g. Reviewed pregnancy status. Approved Tdap & Flu."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-blue-200">
            <span className="text-xs text-blue-800">
              By signing, you confirm that you have reviewed the deterministic rule outputs against the patient's record.
            </span>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              Sign & Save Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
