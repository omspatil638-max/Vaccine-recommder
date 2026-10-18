import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle, Heart, Wind, Droplet, Activity, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function HealthConditionsPage() {
  const conditions = [
    {
      id: 'diabetes',
      title: 'Diabetes Mellitus',
      subtitle: 'Over 100 million adults in India live with diabetes',
      icon: Activity,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      tagColor: 'bg-amber-100 text-amber-800',
      whyVulnerable: 'Elevated blood glucose suppresses phagocytic neutrophil function, impairing immune response to bacteria. In addition, frequent lancet and glucometer testing increases blood exposure risks.',
      vaccines: [
        { name: 'Pneumococcal (PCV / PPSV23)', link: 'pneumococcal-conjugate-polysaccharide', reason: '3-4x elevated risk of bacteremic pneumonia and hospitalization.' },
        { name: 'Hepatitis B Recombinant', link: 'hepatitis-b', reason: 'Recommended due to frequent capillary blood sampling and medical procedures.' },
        { name: 'Annual Seasonal Influenza', link: 'influenza-seasonal', reason: 'Flu infections trigger acute glycemic destabilization and ketoacidosis.' }
      ]
    },
    {
      id: 'respiratory',
      title: 'Asthma, COPD & Post-TB Lungs',
      subtitle: 'Impacted by chronic air quality, biomass smoke & TB history',
      icon: Wind,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      tagColor: 'bg-blue-100 text-blue-800',
      whyVulnerable: 'Chronic airway inflammation and damaged mucosal cilia prevent natural clearing of pathogens, causing simple viral colds to cascade into life-threatening bacterial pneumonia.',
      vaccines: [
        { name: 'Pneumococcal Vaccine', link: 'pneumococcal-conjugate-polysaccharide', reason: 'Essential defense against Streptococcus pneumoniae in damaged lung tissue.' },
        { name: 'Annual Inactivated Flu Shot', link: 'influenza-seasonal', reason: 'Prevents acute asthma flares and COPD hospitalizations during winter/monsoon.' }
      ]
    },
    {
      id: 'cardiovascular',
      title: 'Heart Disease & Hypertension',
      subtitle: 'Leading cause of adult mortality in India',
      icon: Heart,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      tagColor: 'bg-rose-100 text-rose-800',
      whyVulnerable: 'Severe systemic respiratory infections place heavy metabolic strain on the myocardium, significantly increasing rates of acute myocardial infarction (heart attack) and stroke during flu season.',
      vaccines: [
        { name: 'Annual Influenza Vaccine', link: 'influenza-seasonal', reason: 'Clinically proven to reduce heart attacks and cardiovascular deaths during peak flu periods.' },
        { name: 'Pneumococcal Vaccine', link: 'pneumococcal-conjugate-polysaccharide', reason: 'Protects the heart from systemic hypoxia caused by severe pneumonia.' }
      ]
    },
    {
      id: 'kidney-liver',
      title: 'Chronic Kidney & Liver Disease',
      subtitle: 'Dialysis, nephropathy, cirrhosis & fatty liver',
      icon: Droplet,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      tagColor: 'bg-indigo-100 text-indigo-800',
      whyVulnerable: 'Uremia and hepatic cirrhosis compromise both innate and adaptive immunity. Dialysis patients have ongoing bloodstream exposure risks.',
      vaccines: [
        { name: 'Hepatitis B (High-Dose / Adjuvanted)', link: 'hepatitis-b', reason: 'Higher dose or frequent booster schedule often recommended for dialysis patients.' },
        { name: 'Hepatitis A', link: 'hepatitis-a', reason: 'Superimposed Hep A on existing liver cirrhosis causes acute liver failure.' },
        { name: 'Pneumococcal & Flu', link: 'pneumococcal-conjugate-polysaccharide', reason: 'High incidence of invasive bacteremia in CKD and nephrotic syndrome.' }
      ]
    },
    {
      id: 'immunocompromised',
      title: 'Weakened Immunity / Immunosuppression',
      subtitle: 'Chemotherapy, high-dose steroids, biologics, post-transplant',
      icon: ShieldAlert,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      tagColor: 'bg-purple-100 text-purple-800',
      whyVulnerable: 'Immune cell counts are diminished, leaving the body unable to clear infections normally.',
      vaccines: [
        { name: 'Pneumococcal & Flu (Inactivated)', link: 'pneumococcal-conjugate-polysaccharide', reason: 'Crucial protection with killed/inactivated vaccines.' },
        { name: 'Recombinant Shingles (Shingrix)', link: 'herpes-zoster-shingles', reason: 'Safe recombinant formulation that does not contain live virus.' }
      ],
      safetyAlert: 'LIVE VACCINES (MMR, Varicella, live Yellow Fever) ARE CONTRAINDICATED in severely immunocompromised individuals.'
    }
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Health Conditions' }]} />
      <MedicalDisclaimer compact />

      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
          Chronic Care & Vulnerability &bull; India
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Vaccines for Adults with Health Conditions
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Adults with chronic illnesses are at significantly higher risk of severe infections, ICU admissions, and secondary organ damage. Vaccines are a vital pillar of comprehensive chronic disease management.
        </p>
      </div>

      {/* Condition Cards */}
      <div className="space-y-6">
        {conditions.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${item.tagColor}`}>
                      Chronic Risk Category
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Why Vulnerable */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Why You Are at Higher Risk: </strong>
                {item.whyVulnerable}
              </div>

              {/* Safety Alert if applicable */}
              {item.safetyAlert && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl text-xs text-red-950 font-semibold">
                  ⚠️ {item.safetyAlert}
                </div>
              )}

              {/* Vaccines Recommended */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Vaccines to Review with Your Treating Specialist:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {item.vaccines.map((v, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{v.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                          {v.reason}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200/60">
                        <Link
                          to={`/vaccine-library/${v.link}`}
                          className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                        >
                          <span>Learn more</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">
            Managing multiple health conditions?
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Our interactive questionnaire customizes discussion points combining your age and multiple health conditions.
          </p>
        </div>
        <Link
          to="/awareness-guide"
          className="px-5 py-2.5 rounded-xl bg-blue-400 hover:bg-blue-300 text-slate-950 font-bold text-xs shadow transition-all whitespace-nowrap"
        >
          Start Awareness Questionnaire
        </Link>
      </div>
    </div>
  );
}
