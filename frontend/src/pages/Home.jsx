import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  ArrowRight, 
  ClipboardList, 
  Users, 
  User, 
  HeartPulse, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  BookOpen, 
  FileText, 
  QrCode, 
  Share2, 
  Calendar,
  Check
} from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import ClinicPosterModal from '../components/ClinicPosterModal';

export default function Home() {
  const [posterModalOpen, setPosterModalOpen] = useState(false);

  const categories = [
    {
      title: 'Explore by Age',
      description: 'See which vaccines are relevant across life stages: 18–29, 30–49, 50–64, and 65+.',
      to: '/age-groups',
      icon: Users,
      badge: 'All Age Stages',
      color: 'from-blue-600 to-teal-600',
      tagColor: 'bg-blue-100 text-blue-800'
    },
    {
      title: "Men's Health",
      description: 'Adult men priorities including Hepatitis B, Td/Tdap, HPV, flu, and occupational exposures.',
      to: '/mens-health',
      icon: User,
      badge: 'Adult Men',
      color: 'from-teal-600 to-cyan-600',
      tagColor: 'bg-teal-100 text-teal-800'
    },
    {
      title: "Women's Health",
      description: 'Cervical cancer prevention with HPV, pregnancy Tdap/flu guidelines, and rubella catch-up.',
      to: '/womens-health',
      icon: HeartPulse,
      badge: 'Women & Maternity',
      color: 'from-pink-600 to-rose-600',
      tagColor: 'bg-rose-100 text-rose-800'
    },
    {
      title: 'Health Conditions',
      description: 'Vaccine awareness for diabetes, chronic asthma/COPD, heart conditions, liver and kidney disease.',
      to: '/health-conditions',
      icon: Shield,
      badge: 'Chronic Care',
      color: 'from-amber-600 to-orange-600',
      tagColor: 'bg-amber-100 text-amber-800'
    }
  ];

  const barriers = [
    {
      title: '1. The Childhood-Only Myth',
      problem: 'Over 80% of adults in India believe that once school vaccinations are finished, no further vaccines are ever needed.',
      solution: 'Protection against tetanus and pertussis wanes over 10 years, while new vaccines (like shingles and pneumococcal) become essential after age 50.'
    },
    {
      title: '2. Missing Childhood Records',
      problem: 'Many adults lost their paper immunization cards decades ago and worry they cannot receive vaccines without them.',
      solution: 'Doctors can verify immunity using simple blood tests (titers) or recommend safe, standardized adult boosters without needing old cards.'
    },
    {
      title: '3. Cost & Access Confusion',
      problem: 'People often assume adult vaccines are exorbitantly expensive or only found in high-end specialty hospitals.',
      solution: 'Essential vaccines like Td and Rabies are heavily subsidized in government hospitals, and awareness helps plan cost-effective preventive care.'
    },
    {
      title: '4. Fear of Side Effects',
      problem: 'Unverified online claims cause hesitation regarding mild post-vaccination reactions like arm soreness or low fever.',
      solution: 'Verified clinical evidence shows side effects are usually brief (1–2 days) and vastly safer than the life-threatening diseases prevented.'
    }
  ];

  const spotlightTopics = [
    {
      title: 'India & Diabetes Mellitus',
      stat: '100+ Million Adults',
      detail: 'Adults with diabetes face a 3–4x higher risk of severe bacterial pneumonia and greater exposure to Hepatitis B. Pneumococcal and Hep B vaccines are vital discussion topics.',
      link: '/health-conditions'
    },
    {
      title: 'Cervical Cancer & HPV',
      stat: '75,000+ Deaths Annually in India',
      detail: 'Cervical cancer is the 2nd most frequent cancer in Indian women. The HPV vaccine combined with screening can eliminate up to 90% of cervical cancers.',
      link: '/womens-health'
    },
    {
      title: 'Older Adults & Shingles',
      stat: '90%+ Indian Adults Carry Dormant Virus',
      detail: 'Chickenpox virus sleeps in nerve roots. As immunity declines after age 50, shingles can erupt with months of debilitating, burning nerve pain (postherpetic neuralgia).',
      link: '/vaccine-library/herpes-zoster-shingles'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Prominent Medical Disclaimer */}
      <MedicalDisclaimer />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-slate-700">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>SmartVax India &bull; Adult Immunization Awareness System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Vaccines Aren't Just for Children.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-medium leading-relaxed">
            Understand your options. Learn what may be relevant to you. Ask informed questions.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Many adults in India are unaware that immunity wanes with age, or that diabetes, lung conditions, pregnancy, and travel require tailored protection. Explore verified guidelines from <strong>MoHFW</strong>, <strong>NTAGI</strong>, and the <strong>Association of Physicians of India</strong>.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <Link
              to="/vaccine-library"
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm shadow-lg hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 text-center"
            >
              <BookOpen className="w-4 h-4 text-slate-950" />
              <span>Explore Vaccines</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/doctor-checklist"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 transition-all flex items-center justify-center gap-2 text-center"
            >
              <ClipboardList className="w-4 h-4 text-teal-400" />
              <span>Prepare for Your Doctor Visit</span>
            </Link>

            <Link
              to="/awareness-guide"
              className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 text-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Interactive Guide</span>
            </Link>
          </div>
        </div>

        {/* Decorative Graphic Element */}
        <div className="hidden lg:block absolute right-8 bottom-6 opacity-20 pointer-events-none">
          <Shield className="w-80 h-80 text-teal-300" />
        </div>
      </section>

      {/* Core Category Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Explore by Category & Circumstance
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Personalized guidance tailored for your age, gender, and chronic medical status.
            </p>
          </div>
          <Link
            to="/vaccine-library"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All Vaccines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                to={cat.to}
                className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-teal-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cat.tagColor}`}>
                      {cat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                  <span>Explore Topics</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How SmartVax Works */}
      <section className="bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="max-w-2xl mb-8">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-widest bg-teal-200/60 px-2.5 py-1 rounded-md">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            How SmartVax Works for You
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Empowering proactive preventive health without confusing jargon or autonomous diagnosis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-teal-100">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Explore Verified Guidelines
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse vaccines recognized by India's Ministry of Health (MoHFW) and the Association of Physicians of India (API) for adults.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-teal-100">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Identify Relevant Topics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use our private, client-side Awareness Guide to filter topics relevant to your age, diabetes status, lung health, or pregnancy.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-teal-100">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Have an Informed Doctor Visit
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Print or copy our Doctor Visit Checklist to ask precise questions about dose timing, antibody titers, and clinical suitability.
            </p>
          </div>
        </div>
      </section>

      {/* Common Barriers to Adult Vaccination in India */}
      <section className="space-y-6">
        <div>
          <span className="text-[11px] font-bold text-orange-700 uppercase tracking-widest bg-orange-100 px-2.5 py-1 rounded-md">
            Public Health Insight
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            Overcoming Common Barriers to Adult Immunization in India
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Why do millions of Indian adults miss out on preventable health protection? Here is what science and clinical experience tell us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barriers.map((barrier, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                {barrier.title}
              </h3>
              <div className="bg-rose-50/70 border-l-3 border-rose-400 p-2.5 rounded text-xs text-rose-900">
                <strong>Barrier:</strong> {barrier.problem}
              </div>
              <div className="bg-emerald-50/70 border-l-3 border-emerald-500 p-2.5 rounded text-xs text-emerald-900">
                <strong>The Reality:</strong> {barrier.solution}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spotlight Clinical Educational Content */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Awareness Spotlights
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              High-prevalence health priorities highlighted in Indian epidemiological data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spotlightTopics.map((spot, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 mb-2">
                  {spot.stat}
                </span>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  {spot.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {spot.detail}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to={spot.link}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clinic Posters & QR Code Feature Section */}
      <section className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold">
              <QrCode className="w-3.5 h-3.5" />
              Community & Clinic Awareness Initiative
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Connect Clinic Posters to Digital Awareness
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Are you a doctor, clinic coordinator, or health educator in India? Generate ready-to-print QR codes for waiting room posters. Patients scan the code with their smartphone camera to browse vaccines relevant to them while waiting for consultation.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setPosterModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Open Clinic Poster & QR Generator</span>
              </button>
              <Link
                to="/about"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
              >
                <span>Poster Placement Tips</span>
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/20 text-center shrink-0">
            <div className="w-36 h-36 bg-white p-3 rounded-xl mx-auto shadow-md flex items-center justify-center">
              <QrCode className="w-28 h-28 text-slate-900" />
            </div>
            <p className="text-xs font-bold text-teal-300 mt-3">SmartVax QR Connection</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Works on any smartphone camera</p>
          </div>
        </div>
      </section>

      {/* Vaccine Update Reminders CTA */}
      <section className="mt-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white px-6 sm:px-10 py-9 sm:py-11">
          <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Free email alerts
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Get reminded when a new vaccine reaches India
              </h2>
              <p className="mt-2 text-teal-50 text-sm leading-relaxed">
                Subscribe for free and we'll email you when a new adult vaccine becomes available in
                India or MoHFW / API / WHO India guidance is updated — so you can ask your doctor.
              </p>
            </div>
            <Link
              to="/reminders"
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-teal-700 font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:bg-teal-50 transition-colors"
            >
              Set up reminders
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Global Clinic Poster QR Code Modal */}
      <ClinicPosterModal
        isOpen={posterModalOpen}
        onClose={() => setPosterModalOpen(false)}
      />
    </div>
  );
}
