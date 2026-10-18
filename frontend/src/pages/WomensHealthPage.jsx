import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function WomensHealthPage() {
  const womenTopics = [
    {
      title: 'Cervical Cancer Prevention: The HPV Vaccine',
      vaccine: 'Human Papillomavirus (HPV) Vaccine',
      vaccineId: 'human-papillomavirus-hpv',
      highlight: 'Second Most Common Cancer Among Indian Women',
      details: 'Cervical cancer claims over 75,000 lives in India every year. The HPV vaccine provides robust protection against high-risk oncogenic HPV types (16 and 18). Recommended for girls and young women up to age 26, and can be given up to age 45 after clinical discussion.',
      discussion: 'Ask your gynecologist about the HPV vaccine series and when to schedule routine Pap smears / HPV screening.'
    },
    {
      title: 'Pregnancy Protection: Tdap & Inactivated Flu',
      vaccine: 'Tdap & Inactivated Influenza',
      vaccineId: 'tetanus-diphtheria-pertussis-tdap',
      highlight: 'Safeguards Both Mother & Newborn',
      details: 'Administering Tdap during each pregnancy (ideally between weeks 27 and 36) enables maternal antibodies to cross the placenta, shielding the newborn during their most fragile first two months before infant shots begin. Seasonal inactivated flu shots protect against severe maternal respiratory distress.',
      discussion: 'Confirm with your obstetrician regarding timing for Tdap and flu vaccination during your antenatal visits.'
    },
    {
      title: 'Pre-Conception Rubella & Chickenpox Screening',
      vaccine: 'MMR & Varicella Vaccines (Pre-Pregnancy Catch-Up)',
      vaccineId: 'mmr-adult-catchup',
      highlight: 'Preventing Congenital Birth Defects',
      details: 'Rubella (German measles) during early pregnancy can cause catastrophic Congenital Rubella Syndrome (deafness, heart defects, cataracts). Women of childbearing age should verify rubella immunity prior to conceiving.',
      discussion: 'Ask for a pre-conception Rubella IgG antibody blood test. If non-immune, receive the MMR vaccine and avoid pregnancy for at least 28 days afterward.'
    },
    {
      title: 'Mature Adulthood & Post-Menopause Immunity',
      vaccine: 'Shingles & Pneumococcal Vaccines',
      vaccineId: 'herpes-zoster-shingles',
      highlight: 'Ages 50 and Above',
      details: 'Following menopause, hormonal shifts and natural aging influence immune resilience. Vaccines against herpes zoster (shingles) and Streptococcus pneumoniae ensure active, pain-free longevity and respiratory protection.',
      discussion: 'Discuss adding shingles and pneumococcal vaccines to your preventive health screening once you reach age 50.'
    }
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Women's Health" }]} />
      <MedicalDisclaimer compact />

      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
          Women's Health & Maternity &bull; India
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Adult Immunization for Women
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          From cervical cancer prevention in young women to critical antibody transfer during pregnancy and healthy aging, vaccines play an indispensable role in lifelong feminine health.
        </p>
      </div>

      {/* Critical Pregnancy Safety Warning */}
      <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl p-4 md:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-rose-950">
            <h4 className="font-bold text-rose-900">
              Crucial Safety Rule During Active Pregnancy: Live Vaccines are Contraindicated
            </h4>
            <p className="mt-1 leading-relaxed text-rose-900/90">
              In accordance with FOGSI and MoHFW guidelines, <strong>live attenuated vaccines</strong> (such as MMR, Varicella/Chickenpox, and live Yellow Fever) must <strong>NEVER</strong> be administered during active pregnancy. If indicated, these should be completed before pregnancy or administered immediately postpartum.
            </p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {womenTopics.map((topic, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {topic.highlight}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {topic.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {topic.details}
              </p>
              <div className="bg-slate-50 border-l-3 border-rose-400 p-3 rounded-r-xl text-xs text-slate-700">
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

      {/* Bottom CTA */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">
            Have questions for your gynecologist or physician?
          </h3>
          <p className="text-xs text-slate-300">
            Customize and print your Doctor Visit Checklist before your next antenatal or wellness appointment.
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
  );
}
