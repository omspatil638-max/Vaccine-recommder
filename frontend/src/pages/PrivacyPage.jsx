import React from 'react';
import { Link } from 'react-router-dom';
import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

const sections = [
  {
    title: 'Public information pages',
    body: 'The public Awareness Guide runs in your browser and does not require an account. Answers entered there are not sent to the patient account API.',
  },
  {
    title: 'Patient accounts',
    body: 'If you create an account, the service stores your email address and the profile, location, health, vaccination history, safety answers, assessments, and reminders you choose to save. This information supports your patient dashboard and personalized checks.',
  },
  {
    title: 'Vaccine update alerts',
    body: 'In-app alerts are stored with your account. Email alerts are optional and are sent only after you turn them on and email delivery is configured. Alert emails contain the update and a link; they do not include your health answers or assessment details.',
  },
];

export default function PrivacyPage() {
  return <div className="max-w-4xl space-y-8">
    <Breadcrumbs items={[{ label: 'Privacy' }]} />
    <header className="max-w-3xl space-y-3"><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Your information</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Privacy at SmartVax India</h1><p className="text-base leading-7 text-slate-600">The public guide and the signed-in patient account work differently. Here is what each one stores.</p></header>
    <div className="divide-y divide-slate-200 border-y border-slate-200">{sections.map((section) => <section key={section.title} className="py-6"><h2 className="text-xl font-semibold text-slate-950">{section.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{section.body}</p></section>)}</div>
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 p-5"><Download className="h-5 w-5 text-blue-700" aria-hidden="true" /><h2 className="mt-3 font-semibold text-slate-950">Export your account data</h2><p className="mt-2 text-sm leading-6 text-slate-600">Signed-in patients can download the information saved to their account from Settings.</p><Link to="/login" className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-blue-700">Sign in to your account</Link></div>
      <div className="rounded-lg border border-slate-200 p-5"><Trash2 className="h-5 w-5 text-blue-700" aria-hidden="true" /><h2 className="mt-3 font-semibold text-slate-950">Delete your account</h2><p className="mt-2 text-sm leading-6 text-slate-600">Account settings include a delete option. Deletion removes the account and its saved records.</p><Link to="/login" className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-blue-700">Go to account settings</Link></div>
    </section>
    <aside className="flex gap-3 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" /><p>Only enable email alerts if you want these vaccine update messages sent to your account email. You can switch them off in your account at any time.</p></aside>
    <MedicalDisclaimer compact />
  </div>;
}
