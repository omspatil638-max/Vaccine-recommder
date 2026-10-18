import React from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, HeartPulse, Sparkles } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function MensHealthPage() {
  const menTopics = [
    {
      title: 'HPV in Men: Beyond Cervical Cancer',
      vaccine: 'Human Papillomavirus (HPV) Vaccine',
      vaccineId: 'human-papillomavirus-hpv',
      details: 'Many men assume HPV only affects women. In reality, oncogenic HPV strains cause oropharyngeal (throat/tongue) cancers, anal cancers, penile cancers, and genital warts in men. Vaccinating young men cuts transmission and protects their own health.',
      discussion: 'Ask your doctor if you are within the catch-up window (up to age 26, or older after clinical assessment) for the HPV vaccine.'
    },
    {
      title: 'Liver Protection: Hepatitis B Catch-Up',
      vaccine: 'Hepatitis B Vaccine',
      vaccineId: 'hepatitis-b',
      details: 'Adult men in India who missed universal childhood vaccination (phased in around 2005) or work in healthcare, public safety, or travel frequently face elevated Hepatitis B risks. Chronic Hepatitis B is a primary cause of cirrhosis and liver cancer.',
      discussion: 'Ask for a simple Hepatitis B surface antibody (anti-HBs) titer blood test to see if you are already immune.'
    },
    {
      title: 'Workplace, Travel & Injury: Td / Tdap Booster',
      vaccine: 'Td / Tdap (Tetanus, Diphtheria, Pertussis)',
      vaccineId: 'tetanus-diphtheria-pertussis-tdap',
      details: 'Men engaged in agriculture, construction, sports, and outdoor work frequently encounter cuts and soil contamination where tetanus spores thrive. Childhood tetanus shots only protect for 10 years.',
      discussion: 'Ask for a single dose of Tdap (which includes whooping cough protection) to refresh your 10-year booster.'
    },
    {
      title: 'Smoking, COPD & Heart Health: Pneumococcal & Flu',
      vaccine: 'Pneumococcal & Inactivated Influenza',
      vaccineId: 'pneumococcal-conjugate-polysaccharide',
      details: 'Tobacco smoking, air pollution exposure, and chronic bronchitis impair lung cilia, dramatically elevating pneumonia risk. Influenza can also trigger acute coronary syndromes and heart attacks in men with hypertension or cardiovascular disease.',
      discussion: 'Discuss receiving the pneumococcal vaccine and an annual seasonal flu shot.'
    }
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Men's Health" }]} />
      <MedicalDisclaimer compact />

      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
          Men's Health Priorities &bull; India
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Adult Immunization for Men
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Adult men often delay routine preventive check-ups. Vaccines offer powerful, proven defense against liver cancer, throat and genital cancers, severe pneumonia, and workplace injuries.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menTopics.map((topic, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {topic.vaccine}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {topic.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {topic.details}
              </p>
              <div className="bg-slate-50 border-l-3 border-blue-500 p-3 rounded-r-xl text-xs text-slate-700">
                <strong>Doctor Discussion Point:</strong> {topic.discussion}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                to={`/vaccine-library/${topic.vaccineId}`}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>Read detailed vaccine guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Action Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">
            Prepare for an upcoming check-up
          </h3>
          <p className="text-xs text-slate-300">
            Download or copy our practical Doctor Visit Checklist with specific questions on adult immunization.
          </p>
        </div>
        <Link
          to="/doctor-checklist"
          className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow transition-all whitespace-nowrap"
        >
          View Doctor Checklist
        </Link>
      </div>
    </div>
  );
}
