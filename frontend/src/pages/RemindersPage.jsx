import React, { useEffect, useState } from 'react';
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
import localUpdates from '../data/updates.json';
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
  // Live announcements from the Netlify Function (admin `announce`), falling
  // back to any updates bundled with the build.
  const [feed, setFeed] = useState(localUpdates);
  useEffect(() => {
    let active = true;
    fetch('/.netlify/functions/updates')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && Array.isArray(data) && data.length) setFeed(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const recentUpdates = [...feed].sort((a, b) => b.date.localeCompare(a.date));

  // Most recently reviewed vaccines, derived from the live library data.
  const recentlyReviewed = [...vaccines]
    .sort((a, b) => (b.lastReviewed || '').localeCompare(a.lastReviewed || ''))
    .slice(0, 5);

  const lastUpdatedOverall = recentlyReviewed[0]?.lastReviewed;

  const steps = [
    {
      icon: Mail,
      title: 'Create a patient account',
      text: 'Save your country, age, health information and vaccine history securely to your account.',
    },
    {
      icon: RefreshCw,
      title: 'Updates are checked against your profile',
      text: 'A notification is shown only when a reviewed update is linked to a vaccine in your latest assessment.',
    },
    {
      icon: BellRing,
      title: 'Choose in-app and email alerts',
      text: 'Review the update, its source and why it matched. Discuss what it means with your clinician.',
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Vaccine Update Reminders' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white px-6 sm:px-10 py-10 sm:py-14">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-200 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Patient account alerts
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Know when reviewed vaccine guidance may affect you
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Create an account to save your vaccine profile and see relevant updates in your account.
            When email delivery is configured, you can also receive an alert at your sign-in email.
            Alerts explain the change and help you prepare a question for your healthcare professional.
          </p>
          {lastUpdatedOverall && (
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-blue-200 bg-slate-800/60 border border-slate-700 rounded-full px-3 py-1.5">
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
          <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800"><BellRing className="h-5 w-5" aria-hidden="true" /></span>
              <div><p className="text-sm font-semibold text-blue-800">For patients</p><h2 className="mt-1 text-xl font-semibold text-slate-950">Get updates that fit your saved profile</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Your age, country, health answers and vaccine history help the assessment identify whether a reviewed update may be relevant. You stay in control of alert preferences.</p>
                <div className="mt-5 flex flex-wrap gap-3"><Link to="/signup" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Create an account</Link><Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">Sign in</Link></div>
                <p className="mt-4 text-xs leading-5 text-slate-500">Email delivery is available only when configured for this service. A scheduled backend worker can deliver alerts while you’re signed out; otherwise alerts refresh when you use your account. An alert is educational and does not confirm that a vaccine is safe or appropriate for you.</p>
              </div>
            </div>
          </section>

          {/* How it works */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">How patient alerts work</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
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
              <CalendarClock className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900">What's new</h2>
            </div>
            {recentUpdates.length ? <ol className="space-y-4">
              {recentUpdates.map((u) => (
                <li key={u.id} className="relative pl-5 border-l-2 border-blue-100">
                  <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        u.type === 'new'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
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
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      View vaccine <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </li>
              ))}
            </ol> : <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">There are no source-verified vaccine updates in the feed yet. We’ll show updates here after they have been checked against an official source and matched to the correct guideline.</p>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900 mb-3 text-sm">Recently reviewed guidance</h2>
            <ul className="divide-y divide-slate-100">
              {recentlyReviewed.map((v) => (
                <li key={v.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link
                    to={`/vaccine-library/${v.id}`}
                    className="text-sm font-medium text-slate-700 hover:text-blue-700 truncate"
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
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Browse full vaccine library <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
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
