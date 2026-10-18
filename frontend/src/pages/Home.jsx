import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, HeartPulse, ShieldCheck, UsersRound } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

const paths = [
  { title: 'Browse by age', description: 'Understand how vaccine discussions can change through adulthood.', to: '/age-groups', icon: UsersRound, label: 'Age groups' },
  { title: 'Browse by health situation', description: 'Explore topics related to pregnancy, chronic conditions and other circumstances.', to: '/health-conditions', icon: HeartPulse, label: 'Health situations' },
  { title: 'Explore the vaccine library', description: 'Look up a vaccine, what it protects against and questions to take to your clinician.', to: '/vaccine-library', icon: BookOpen, label: 'Vaccine library' },
];

export default function Home() {
  return (
    <div className="space-y-16 pb-10 sm:space-y-20">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        <div className="absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" aria-hidden="true" />
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-200"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Adult vaccination guidance for India</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">A clearer conversation about adult vaccines.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Learn which vaccines may be worth discussing for your age and circumstances, why they matter, and what to ask a healthcare professional.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/awareness-guide" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Start the guided check <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/vaccine-library" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 px-5 py-3 font-semibold text-white transition hover:bg-white/10">Browse vaccines</Link>
          </div>
          <p className="mt-5 text-sm text-slate-400">No account needed. Your guide answers stay in this browser.</p>
        </div>
      </section>

      <section aria-labelledby="how-title" className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">A simple place to start</p>
          <h2 id="how-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Understand first. Decide with your clinician.</h2>
          <p className="mt-4 max-w-lg leading-7 text-slate-600">Recommendations can depend on age, previous doses, health conditions, pregnancy, travel and local guidance. This site helps you prepare, not diagnose or prescribe.</p>
        </div>
        <ol className="divide-y divide-slate-200 border-y border-slate-200">
          {[
            ['01', 'Choose a topic', 'Start with your age, health situation or a vaccine name.'],
            ['02', 'See why it may matter', 'Review the relevant context and source information.'],
            ['03', 'Take questions to a clinician', 'Use the checklist to discuss your history and next steps.'],
          ].map(([number, title, description]) => <li key={number} className="flex gap-5 py-5"><span className="pt-0.5 font-mono text-sm text-blue-700">{number}</span><div><h3 className="font-semibold text-slate-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div></li>)}
        </ol>
      </section>

      <section aria-labelledby="explore-title">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">Explore</p><h2 id="explore-title" className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Find the information you need</h2></div>
          <Link to="/doctor-checklist" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">Prepare for a visit <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {paths.map(({ title, description, to, icon: Icon, label }) => <Link key={to} to={to} className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-800"><Icon className="h-5 w-5" aria-hidden="true" /></span>
            <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">{label}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
          </Link>)}
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-slate-100/70 p-6 sm:grid-cols-2 sm:p-8">
        <div className="flex gap-4"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-800"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-semibold text-slate-950">Evidence you can follow</h2><p className="mt-2 text-sm leading-6 text-slate-600">Guidance pages identify their sources so you can see where information comes from.</p><Link to="/about" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">How this guide is made <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
        <div className="flex gap-4"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-800"><ClipboardCheck className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-semibold text-slate-950">A useful appointment</h2><p className="mt-2 text-sm leading-6 text-slate-600">Bring your vaccine record if you have it, and ask a qualified clinician what applies to you.</p><Link to="/doctor-checklist" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">Open the doctor checklist <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
      </section>

      <MedicalDisclaimer compact />
    </div>
  );
}
