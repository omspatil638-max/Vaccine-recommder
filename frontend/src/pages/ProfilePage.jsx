import React, { useState } from 'react';
import { User, Calendar, MapPin, Heart, ShieldAlert, Briefcase, Plane, Save, RefreshCw } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function ProfilePage({ profile, onSaveProfile }) {
  const [formData, setFormData] = useState({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelect = (fieldName, option) => {
    setFormData((prev) => {
      const current = prev[fieldName] || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [fieldName]: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate age if DOB provided
    let calculatedAge = formData.age;
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
    }
    const updated = { ...formData, age: calculatedAge };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const medicalConditionOptions = [
    { id: 'asthma', label: 'Asthma / Chronic Respiratory Disease' },
    { id: 'type_2_diabetes', label: 'Diabetes Mellitus' },
    { id: 'chronic_kidney_disease', label: 'Chronic Kidney Disease / Dialysis' },
    { id: 'chronic_liver_disease', label: 'Chronic Liver Disease / Cirrhosis' },
    { id: 'heart_disease', label: 'Cardiovascular Disease' },
    { id: 'asplenia', label: 'Functional or Anatomic Asplenia' }
  ];

  const allergyOptions = [
    { id: 'neomycin_severe_anaphylaxis', label: 'Neomycin / Polymyxin B Anaphylaxis' },
    { id: 'egg_severe_anaphylaxis', label: 'Severe Egg Protein Anaphylaxis' },
    { id: 'gelatin_allergy', label: 'Gelatin Hypersensitivity' },
    { id: 'latex_allergy', label: 'Latex Allergy' }
  ];

  const immunoMedOptions = [
    { id: 'prednisone_high_dose', label: 'High-Dose Corticosteroids (e.g. Prednisone ≥20mg/day)' },
    { id: 'chemotherapy', label: 'Active Chemotherapy / Radiation Therapy' },
    { id: 'organ_transplant_immuno', label: 'Post-Organ Transplant Immunosuppressants' },
    { id: 'biologics_tnf_blockers', label: 'Biologic Therapies / Anti-TNF Agents' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <MedicalDisclaimer compact />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              User Profile & Clinical Baseline
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Synthetic demographic, medical, and exposure data used by the rule engine to determine vaccine eligibility.
            </p>
          </div>
          <span className="bg-blue-50 text-blue-700 text-xs font-mono font-semibold px-2.5 py-1 rounded-full">
            {formData.id}
          </span>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-600" />
            Profile updated successfully! Recommendation engine evaluation triggered.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-600" />
              1. Demographics & Region
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Synthetic Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sex (Clinically Relevant)</label>
                <select
                  name="sex"
                  value={formData.sex || 'female'}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Country / Region Guidelines</label>
                <select
                  name="country"
                  value={formData.country || 'IN'}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="IN">India (MoHFW / NTAGI / API Guidelines)</option>
                  <option value="WHO">WHO Global Guidelines</option>
                </select>
              </div>
              {formData.sex === 'female' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pregnancy Status</label>
                  <select
                    name="pregnancyStatus"
                    value={formData.pregnancyStatus || 'not_pregnant'}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="not_pregnant">Not Pregnant</option>
                    <option value="pregnant_1st_trimester">Pregnant - 1st Trimester</option>
                    <option value="pregnant_2nd_trimester">Pregnant - 2nd Trimester (Weeks 14-27)</option>
                    <option value="pregnant_3rd_trimester">Pregnant - 3rd Trimester (Weeks 28-40)</option>
                    <option value="postpartum_lactating">Postpartum / Lactating</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Clinical Conditions */}
          <div className="border-t pt-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-red-600" />
              2. Medical Conditions & High-Risk Factors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {medicalConditionOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    (formData.medicalConditions || []).includes(opt.id)
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(formData.medicalConditions || []).includes(opt.id)}
                    onChange={() => handleMultiSelect('medicalConditions', opt.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Immunocompromise & Allergies */}
          <div className="border-t pt-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              3. Immunocompromise & Allergies (Contraindications)
            </h3>
            
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  name="immunocompromised"
                  checked={formData.immunocompromised || false}
                  onChange={handleChange}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Patient has an Immunocompromising Condition or Therapy
              </label>
              {formData.immunocompromised && (
                <div className="pl-6 space-y-2 mt-2">
                  <p className="text-xs text-gray-500">Select active medications / therapies:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {immunoMedOptions.map((med) => (
                      <label key={med.id} className="flex items-center gap-2 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={(formData.immunoMedications || []).includes(med.id)}
                          onChange={() => handleMultiSelect('immunoMedications', med.id)}
                          className="rounded text-blue-600"
                        />
                        {med.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Known Severe Vaccine Allergies / Anaphylaxis</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {allergyOptions.map((alg) => (
                  <label key={alg.id} className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={(formData.allergies || []).includes(alg.id)}
                      onChange={() => handleMultiSelect('allergies', alg.id)}
                      className="rounded text-blue-600"
                    />
                    {alg.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Occupation & Travel */}
          <div className="border-t pt-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              4. Occupation Exposure & Travel Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Occupation Exposure</label>
                <select
                  name="occupation"
                  value={formData.occupation || 'none'}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Standard / Non-exposure</option>
                  <option value="healthcare_worker">Healthcare Personnel / Clinical Staff</option>
                  <option value="laboratory_personnel">Microbiology / Research Lab Worker</option>
                  <option value="childcare_teacher">Childcare / Early Education Provider</option>
                  <option value="veterinary_animal">Veterinarian / Animal Handler</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Travel Destination</label>
                <input
                  type="text"
                  name="travelDestination"
                  placeholder="e.g. Brazil, Kenya, Thailand"
                  value={formData.travelDestination || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Departure Date</label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t pt-6 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Profile & Re-Evaluate Rules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
