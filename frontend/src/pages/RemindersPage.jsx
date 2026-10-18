import React from 'react';
import { Link } from 'react-router-dom';
import {
  BellRing,
  CalendarClock,
  Sparkles,
  RefreshCw,
  Mail,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import ReminderSignup from '../components/ReminderSignup';
import updates from '../data/updates.json';
import vaccines from '../data/vaccines.json';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function RemindersPage() {
  // Most recent explicit announcements (owner-curated feed).
  const recentUpdates = [...updates].sort((a, b) => b.date.localeCompare(a.date));

  // Most recently reviewed vaccines, derived from the live library data.
  const recentlyReviewed = [...vaccines]
    .sort((a, b) => (b.lastReviewed || '').localeCompare(a.lastReviewed || ''))
    .slice(0, 5);

  const lastUpdatedOverall = recentlyReviewed[0]?.lastReviewed;

  const steps = [
    {
      icon: Mail,
      title: 'Sign up with your email',
      text: 'Tell us your age group and any health conditions so alerts stay relevant to you.',
    },
    {
      icon: RefreshCw,
      title: 'We track Indian guidance',
      text: 'Our library follows MoHFW, NTAGI, API and WHO India — and shows when each vaccine was last reviewed.',
    },
    {
      icon: BellRing,
      title: 'You get notified',
      text: 'When a new adult vaccine arrives in India or guidance changes, you receive an email so you can ask your doctor.',
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Vaccine Update Reminders' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white px-6 sm:px-10 py-10 sm:py-14">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-500/30 text-teal-200 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Free email reminders
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Never miss a new vaccine available in India
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Adult immunization guidance keeps evolving. Subscribe for free and we'll email you when a
            new adult vaccine reaches the Indian market, or when MoHFW / API / WHO India update their
            recommendations — so you always know whether there's something new to discuss with your
            doctor.
          </p>
          {lastUpdatedOverall && (
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-teal-200 bg-slate-800/60 border border-slate-700 rounded-full px-3 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              Library last reviewed: <strong className="text-white">{formatDate(lastUpdatedOverall)}</strong>
            </p>
          )}
        </div>
      </section>

      {/* Main grid: signup + what's new */}
      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Signup */}
        <div className="lg:col-span-3">
          <ReminderSignup />

          {/* How it works */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">How reminders work</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5" />
                    </span>
                    <h3 className="mt-3 font-bold text-sm text-slate-900">{s.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{s.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* What's new */}
        <aside className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="w-5 h-5 text-teal-600" />
              <h2 className="font-bold text-slate-900">What's new</h2>
            </div>
            <ol className="space-y-4">
              {recentUpdates.map((u) => (
                <li key={u.id} className="relative pl-5 border-l-2 border-teal-100">
                  <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-teal-50" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        u.type === 'new'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {u.type === 'new' ? 'New vaccine' : 'Guidance updated'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{formatDate(u.date)}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900 leading-snug">{u.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{u.summary}</p>
                  {u.vaccineId && (
                    <Link
                      to={`/vaccine-library/${u.vaccineId}`}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                    >
                      View vaccine <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900 mb-3 text-sm">Recently reviewed guidance</h2>
            <ul className="divide-y divide-slate-100">
              {recentlyReviewed.map((v) => (
                <li key={v.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link
                    to={`/vaccine-library/${v.id}`}
                    className="text-sm font-medium text-slate-700 hover:text-teal-700 truncate"
                  >
                    {v.name}
                  </Link>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {formatDate(v.lastReviewed)}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/vaccine-library"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Browse full vaccine library <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800 leading-relaxed">
              Reminders are purely educational and India-focused. Whether a new vaccine is right for
              <strong> you</strong> is always a decision for your registered doctor (MBBS/MD).
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-10">
        <MedicalDisclaimer compact />
      </div>
    </div>
  );
}
