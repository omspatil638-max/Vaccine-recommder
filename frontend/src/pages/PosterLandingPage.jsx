import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  BookOpen, 
  Users, 
  ClipboardList, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  HeartPulse, 
  AlertCircle,
  QrCode,
  Activity,
  Wind,
  Droplet,
  Heart,
  User,
  ShieldCheck,
  Filter
} from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import vaccinesData from '../data/vaccines.json';

export default function PosterLandingPage() {
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  const categoryCards = [
    {
      id: 'age-groups',
      title: 'Explore by Age Groups',
      subtitle: '18–29, 30–49, 50–64, and 65+',
      desc: 'Lifelong protection: see which vaccines are prioritized as immune resilience changes with age.',
      link: '/age-groups',
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: '4 Life Stages'
    },
    {
      id: 'diabetes',
      title: 'Diabetes Mellitus',
      subtitle: 'Pneumococcal, Hep B & Flu',
      desc: 'India has over 100M diabetic adults. Protect against a 3–4x higher risk of severe bacterial pneumonia.',
      link: '/health-conditions',
      icon: Activity,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: 'High Priority'
    },
    {
      id: 'respiratory',
      title: 'Asthma, COPD & Lungs',
      subtitle: 'Airway Defense & Flu',
      desc: 'Chronic lung inflammation makes ordinary seasonal infections dangerous. Essential lung shielding.',
      link: '/health-conditions',
      icon: Wind,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      badge: 'Lung Health'
    },
    {
      id: 'womens-health',
      title: "Women's Health & Maternity",
      subtitle: 'HPV Cervical Cancer & Pregnancy',
      desc: 'HPV vaccine prevents cervical cancer; Tdap during weeks 27–36 transfers antibodies to newborns.',
      link: '/womens-health',
      icon: HeartPulse,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      badge: 'Maternity'
    },
    {
      id: 'mens-health',
      title: "Men's Health Priorities",
      subtitle: 'HPV in Men, Hep B & Tdap',
      desc: 'Protects against oncogenic throat/genital cancers, chronic liver cirrhosis, and occupational injuries.',
      link: '/mens-health',
      icon: User,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      badge: 'Adult Men'
    },
    {
      id: 'doctor-checklist',
      title: 'Doctor Visit Checklist',
      subtitle: 'What to Ask During Consultation',
      desc: 'Interactive checkbox tool with key questions regarding antibody titers, dose intervals, and safety.',
      link: '/doctor-checklist',
      icon: ClipboardList,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Checklist Tool'
    }
  ];

  // Quick filter pills for instant in-page viewing
  const filterPills = [
    { id: 'all', label: 'All Categories' },
    { id: 'seniors', label: 'Age 50+ & 65+ (Seniors)' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'respiratory', label: 'Asthma / COPD' },
    { id: 'pregnancy', label: 'Pregnancy & Maternity' },
    { id: 'young-adults', label: 'Young Adults (18–29)' }
  ];

  // Filtered vaccines for live in-page display
  const liveVaccines = vaccinesData.filter((v) => {
    if (activeCategoryTab === 'all') return true;
    if (activeCategoryTab === 'seniors') {
      return (v.applicableAgeGroups || []).includes('65+') || (v.applicableAgeGroups || []).includes('50-64');
    }
    if (activeCategoryTab === 'diabetes') {
      return (v.healthConditions || []).includes('diabetes');
    }
    if (activeCategoryTab === 'respiratory') {
      return (v.healthConditions || []).includes('respiratory');
    }
    if (activeCategoryTab === 'pregnancy') {
      return (v.healthConditions || []).includes('pregnancy') || (v.tags || []).includes('pregnancy');
    }
    if (activeCategoryTab === 'young-adults') {
      return (v.applicableAgeGroups || []).includes('18-29');
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Top Banner indicating QR Scan Context */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-800 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
          <QrCode className="w-3.5 h-3.5" />
          <span>Scanned from Clinic Poster &bull; Direct Category Portal</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          Adult Immunization Categories & Guide
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Welcome! While you wait for your doctor consultation, explore the categories below to learn which vaccines are recommended for your age, chronic health conditions, or personal circumstances in India.
        </p>

        {/* Quick CTA row */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            to="/doctor-checklist"
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <ClipboardList className="w-4 h-4 text-slate-950" />
            <span>Open Doctor Checklist</span>
          </Link>
          <Link
            to="/awareness-guide"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Interactive 2-Min Guide</span>
          </Link>
        </div>
      </div>

      {/* Prominent Medical Disclaimer */}
      <MedicalDisclaimer compact />

      {/* Primary Category Hub Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Browse Categories
            </h2>
            <p className="text-xs text-slate-500">
              Select a category to view detailed clinical guidance and verified Indian sources.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={cat.link}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-teal-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700">
                      {cat.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-semibold text-teal-800 mt-0.5">
                    {cat.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                  <span>Explore this category</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Instant In-Page Category Filter: Instant Vaccine Results */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
              Instant Waiting Room Browser
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              Vaccines by Category ({liveVaccines.length})
            </h2>
          </div>
          <Link
            to="/vaccine-library"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>Open Full Library with Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {filterPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveCategoryTab(pill.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeCategoryTab === pill.id
                  ? 'bg-teal-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Live Filtered Vaccine Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveVaccines.slice(0, 8).map((v) => (
            <div
              key={v.id}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:bg-white hover:shadow-xs transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {v.category}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {v.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Prevents:</strong> {v.prevention}
                </p>
                <p className="text-xs text-slate-500">
                  <strong>Who:</strong> {v.whoMayBenefit}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <Link
                  to={`/vaccine-library/${v.id}`}
                  className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/doctor-checklist"
                  className="text-slate-500 hover:text-slate-800 text-[11px]"
                >
                  + Add to Checklist
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Waiting Room Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-xs text-slate-600">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          How to Use This While Waiting for Your Doctor
        </h4>
        <p className="leading-relaxed">
          1. Tap on any category above (e.g. <strong>Diabetes</strong>, <strong>Age 50+ Shingles</strong>, or <strong>Pregnancy</strong>) to learn which vaccines apply.
        </p>
        <p className="leading-relaxed">
          2. Open the <strong>Doctor Visit Checklist</strong> to tick the questions you want to ask your clinician.
        </p>
        <p className="leading-relaxed">
          3. Mention your current medications and past history to your physician (MBBS/MD) for personalized medical advice.
        </p>
      </div>
    </div>
  );
}
