import React, { useState } from 'react';
import { BellRing, CheckCircle2, Mail, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

/**
 * Vaccine-update reminder sign-up.
 *
 * Uses Netlify Forms — a free, serverless capture built into Netlify hosting.
 * No backend, no API keys, no third-party accounts. Submissions are stored in
 * the Netlify dashboard and the site owner is emailed on each new sign-up
 * (enable "Form submission notifications" in Netlify → Forms).
 *
 * A matching hidden static form lives in index.html so Netlify's build bot
 * registers the form name and fields at deploy time.
 */

const FORM_NAME = 'vaccine-reminders';

const AGE_GROUPS = [
  { value: '', label: 'Select your age group (optional)' },
  { value: '18-29', label: '18 – 29 years' },
  { value: '30-49', label: '30 – 49 years' },
  { value: '50-64', label: '50 – 64 years' },
  { value: '65+', label: '65 years and above' },
];

const CONDITIONS = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'respiratory', label: 'Asthma / COPD / Lung' },
  { value: 'cardiovascular', label: 'Heart disease' },
  { value: 'kidney', label: 'Kidney / Liver' },
  { value: 'pregnancy', label: 'Pregnancy' },
  { value: 'immunocompromised', label: 'Low immunity' },
];

const FREQUENCIES = [
  { value: 'every-update', label: 'Every new vaccine or guideline update' },
  { value: 'monthly-digest', label: 'A monthly digest only' },
];

function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

export default function ReminderSignup({ compact = false }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    ageGroup: '',
    frequency: 'every-update',
  });
  const [conditions, setConditions] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleCondition = (value) =>
    setConditions((c) => (c.includes(value) ? c.filter((v) => v !== value) : [...c, value]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address so we can reach you.');
      return;
    }

    setStatus('submitting');

    const payload = {
      'form-name': FORM_NAME,
      'bot-field': '', // honeypot, left empty by humans
      name: form.name,
      email: form.email,
      ageGroup: form.ageGroup,
      healthConditions: conditions.join(', '),
      frequency: form.frequency,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(payload),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        'Could not submit right now. This form only works on the deployed Netlify site — please try again there, or check your connection.'
      );
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-teal-900">You're on the list 🎉</h3>
        <p className="mt-2 text-sm text-teal-800 max-w-md mx-auto leading-relaxed">
          We'll email <strong>{form.email}</strong> whenever a new adult vaccine becomes available in
          India or existing MoHFW / API / WHO India guidance is updated — so you can discuss it with
          your doctor.
        </p>
        <p className="mt-3 text-[11px] text-teal-700">
          No spam, no sharing your details. You can unsubscribe from any email.
        </p>
      </div>
    );
  }

  return (
    <form
      name={FORM_NAME}
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm"
    >
      {/* Netlify needs these two hidden inputs present in the rendered form too */}
      <input type="hidden" name="form-name" value={FORM_NAME} />
      <p className="hidden">
        <label>
          Don't fill this out if you're human: <input name="bot-field" />
        </label>
      </p>

      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
          <BellRing className="w-4.5 h-4.5" />
        </span>
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
            Get vaccine-update reminders
          </h3>
          <p className="text-xs text-slate-500">
            Free email alerts when new adult vaccines reach India.
          </p>
        </div>
      </div>

      <div className={`mt-5 grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <div>
          <label htmlFor="rs-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Name <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="rs-name"
            name="name"
            type="text"
            value={form.name}
            onChange={update('name')}
            autoComplete="name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="rs-email" className="block text-xs font-semibold text-slate-700 mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            id="rs-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="rs-age" className="block text-xs font-semibold text-slate-700 mb-1">
          Age group
        </label>
        <select
          id="rs-age"
          name="ageGroup"
          value={form.ageGroup}
          onChange={update('ageGroup')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
        >
          {AGE_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="mt-4">
        <legend className="block text-xs font-semibold text-slate-700 mb-2">
          Health conditions <span className="font-normal text-slate-400">(optional — for relevant alerts)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => {
            const active = conditions.includes(c.value);
            return (
              <button
                type="button"
                key={c.value}
                onClick={() => toggleCondition(c.value)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-600 hover:border-teal-400'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="block text-xs font-semibold text-slate-700 mb-2">How often?</legend>
        <div className="space-y-1.5">
          {FREQUENCIES.map((f) => (
            <label key={f.value} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value={f.value}
                checked={form.frequency === f.value}
                onChange={update('frequency')}
                className="text-teal-600 focus:ring-teal-500"
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      {status === 'error' && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm px-4 py-3 rounded-xl shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" /> Notify me about new vaccines
          </>
        )}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
        Free forever · We never sell or share your details · Unsubscribe anytime
      </p>
    </form>
  );
}
