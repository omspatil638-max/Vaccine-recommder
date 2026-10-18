import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, BookOpen, ClipboardList, HelpCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function NotFoundPage() {
  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Page Not Found' }]} />

      <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-14 text-center max-w-xl mx-auto my-8 space-y-4 shadow-xs">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          404 — Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          The page or route you requested does not exist on SmartVax India. Please use the navigation links below to explore adult immunization awareness.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </Link>
          <Link
            to="/vaccine-library"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>Vaccine Library</span>
          </Link>
          <Link
            to="/doctor-checklist"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-teal-600" />
            <span>Doctor Checklist</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
