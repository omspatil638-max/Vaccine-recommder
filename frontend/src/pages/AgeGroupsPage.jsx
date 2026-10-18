import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Users, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Info, Sparkles, Calendar } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export const AGE_GROUPS_DATA = [
  {
    id: '18-29',
    title: 'Young Adults (Ages 18–29)',
    subtitle: 'Catch-up immunity, cancer prevention, college/hostel exposures, and occupational start.',
    theme: 'from-blue-500 to-blue-500',
    badgeColor: 'bg-blue-100 text-blue-800',
    keyVaccines: [
      {
        name: 'HPV (Human Papillomavirus)',
        reason: 'Protects against cervical cancer in young women and oncogenic cancers in young men. Most effective before exposure.',
        id: 'human-papillomavirus-hpv'
      },
      {
        name: 'Hepatitis B Catch-Up',
        reason: 'Many adults born before universal childhood Hep B rollout (circa 2005 in India) remain unvaccinated.',
        id: 'hepatitis-b'
      },
      {
        name: 'Td / Tdap (Tetanus & Whooping Cough)',
        reason: 'Routine 10-year booster required as childhood immunity wanes. Tdap essential during pregnancy.',
        id: 'tetanus-diphtheria-pertussis-tdap'
      },
      {
        name: 'MMR & Varicella Catch-Up',
        reason: 'For adults with missing childhood records or non-immune status before pregnancy or hostel entry.',
        id: 'mmr-adult-catchup'
      }
    ],
    clinicalNote: 'Young adults in India are often entering the workforce, colleges, or starting families. This is the optimal window to catch up on missed childhood protection.'
  },
  {
    id: '30-49',
    title: 'Middle Adulthood (Ages 30–49)',
    subtitle: 'Family protection, emerging lifestyle conditions (early diabetes/hypertension), and travel.',
    theme: 'from-blue-600 to-emerald-600',
    badgeColor: 'bg-blue-100 text-blue-800',
    keyVaccines: [
      {
        name: 'Annual Influenza (Flu)',
        reason: 'Crucial for busy working adults and parents to avoid missed work and protect infants and aging parents at home.',
        id: 'influenza-seasonal'
      },
      {
        name: 'Tdap During Every Pregnancy',
        reason: 'Given between weeks 27–36 of each pregnancy to pass vital antibodies to the newborn against whooping cough.',
        id: 'tetanus-diphtheria-pertussis-tdap'
      },
      {
        name: 'Hepatitis B & A',
        reason: 'Recommended if managing diabetes, chronic liver conditions, or frequent dining out/travel.',
        id: 'hepatitis-b'
      },
      {
        name: 'Typhoid (TCV)',
        reason: 'Conjugate vaccine for adults in endemic zones or food handling.',
        id: 'typhoid-conjugate-tcv'
      }
    ],
    clinicalNote: 'With rising rates of young-onset Type 2 diabetes in urban and semi-urban India, early preventive vaccination prevents future infectious complications.'
  },
  {
    id: '50-64',
    title: 'Pre-Senior Adults (Ages 50–64)',
    subtitle: 'Immune aging (immunosenescence), prevention of severe shingles nerve pain, and lung defense.',
    theme: 'from-amber-600 to-orange-600',
    badgeColor: 'bg-amber-100 text-amber-800',
    keyVaccines: [
      {
        name: 'Shingles (Recombinant Zoster)',
        reason: 'Risk of shingles surges after age 50 as cell-mediated immunity drops. 2 doses prevent excruciating nerve pain (PHN).',
        id: 'herpes-zoster-shingles'
      },
      {
        name: 'Pneumococcal Vaccine',
        reason: 'API guidelines recommend discussing pneumococcal protection starting at age 50, especially if diabetic or smoker.',
        id: 'pneumococcal-conjugate-polysaccharide'
      },
      {
        name: 'Annual Inactivated Influenza',
        reason: 'Protects against flu-induced cardiovascular stress, heart attacks, and secondary pneumonia.',
        id: 'influenza-seasonal'
      },
      {
        name: 'Td / Tdap 10-Year Booster',
        reason: 'Keeps tetanus protection current for agricultural work, home gardening, and injuries.',
        id: 'tetanus-diphtheria-pertussis-tdap'
      }
    ],
    clinicalNote: 'Age 50 marks the milestone recommended by the Association of Physicians of India (API) to begin discussing adult-specific vaccines.'
  },
  {
    id: '65+',
    title: 'Senior Adults (Ages 65 and Above)',
    subtitle: 'Vital defense against pneumonia, shingles, and influenza-associated hospitalizations.',
    theme: 'from-purple-600 to-indigo-600',
    badgeColor: 'bg-purple-100 text-purple-800',
    keyVaccines: [
      {
        name: 'Pneumococcal (PCV & PPSV23)',
        reason: 'Universal API recommendation for all seniors ≥65. Major defense against life-threatening bacterial pneumonia and sepsis.',
        id: 'pneumococcal-conjugate-polysaccharide'
      },
      {
        name: 'Shingles (Herpes Zoster)',
        reason: 'Seniors have the highest incidence of chronic nerve pain following shingles. Vaccination provides high clinical efficacy.',
        id: 'herpes-zoster-shingles'
      },
      {
        name: 'Annual Influenza (Quadrivalent Inactivated)',
        reason: 'Seniors account for the vast majority of severe flu mortality in India. Yearly vaccination is essential.',
        id: 'influenza-seasonal'
      },
      {
        name: 'Td Booster Every 10 Years',
        reason: 'Ensures lifelong protection against fatal tetanus lockjaw.',
        id: 'tetanus-diphtheria-pertussis-tdap'
      }
    ],
    clinicalNote: 'In seniors, vaccines significantly reduce emergency hospitalizations, intensive care admissions, and loss of physical independence.'
  }
];

export default function AgeGroupsPage() {
  const { group } = useParams();

  // Normalize group param (e.g. '65-plus' -> '65+')
  const normalizedGroup = group === '65-plus' ? '65+' : group;
  const singleGroup = normalizedGroup
    ? AGE_GROUPS_DATA.find((g) => g.id === normalizedGroup)
    : null;

  // If a specific group route was opened: /age-groups/:group
  if (singleGroup) {
    return (
      <div className="space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Explore by Age', to: '/age-groups' },
            { label: singleGroup.title }
          ]}
        />
        <MedicalDisclaimer compact />

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <Link
                to="/age-groups"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-700 transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>View All Age Groups</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {singleGroup.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {singleGroup.subtitle}
              </p>
            </div>
            <Link
              to={`/vaccine-library?age=${singleGroup.id}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>Filter Library for this Age</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Clinical Rationale */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-2xl text-xs sm:text-sm text-blue-950 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-950 font-bold">Clinical Guidance Context in India:</strong>{' '}
              <span className="text-blue-900">{singleGroup.clinicalNote}</span>
            </div>
          </div>

          {/* Key Vaccines for this age */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Recommended Vaccines to Review with Your Doctor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {singleGroup.keyVaccines.map((v, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{v.name}</span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                      {v.reason}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                    <Link
                      to={`/vaccine-library/${v.id}`}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      <span>Read detailed clinical guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist reminder */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold">
                Preparing questions for your doctor?
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Download or print your customized Doctor Visit Checklist for this age bracket.
              </p>
            </div>
            <Link
              to="/doctor-checklist"
              className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow transition-all whitespace-nowrap"
            >
              Open Doctor Checklist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // All Age Groups View
  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Explore by Age' }]} />
      <MedicalDisclaimer compact />

      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
          Life-Stage Guidance &bull; India
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Adult Immunization by Age Group
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Immunization needs evolve as we age. Childhood protection can wane, workplace and travel risks change, and our immune systems naturally experience age-related shifts (immunosenescence).
        </p>
        <p className="text-xs text-slate-500 italic">
          Note: An age recommendation does not mean every adult in that bracket automatically requires every vaccine. Suitability is confirmed with your doctor.
        </p>
      </div>

      {/* Age Cards Grid */}
      <div className="space-y-6">
        {AGE_GROUPS_DATA.map((item) => (
          <div
            key={item.id}
            id={`age-${item.id}`}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${item.badgeColor}`}>
                  {item.id === '65+' ? 'Ages 65 and Older' : `Ages ${item.id}`}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                  <Link
                    to={`/age-groups/${item.id === '65+' ? '65-plus' : item.id}`}
                    className="hover:text-blue-700 transition-colors"
                  >
                    {item.title}
                  </Link>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  {item.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  to={`/age-groups/${item.id === '65+' ? '65-plus' : item.id}`}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <span>Dedicated View</span>
                </Link>
                <Link
                  to={`/vaccine-library?age=${item.id}`}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>Filter Library</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Key Vaccines for this age */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Key Vaccines to Discuss with Your Doctor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {item.keyVaccines.map((v, i) => (
                  <div key={i} className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{v.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {v.reason}
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex justify-end">
                      <Link
                        to={`/vaccine-library/${v.id}`}
                        className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <span>View vaccine details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical context footnote */}
            <div className="bg-blue-50/70 border-l-4 border-blue-400 p-3 rounded-r-xl text-xs text-blue-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Clinical Context (India):</strong> {item.clinicalNote}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Not sure which age guidance applies to your health?
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Use our 2-minute Awareness Guide to match your exact age with relevant chronic conditions.
          </p>
        </div>
        <Link
          to="/awareness-guide"
          className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow transition-all whitespace-nowrap"
        >
          Take Awareness Questionnaire
        </Link>
      </div>
    </div>
  );
}
