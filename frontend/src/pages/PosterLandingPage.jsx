import React from 'react';
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
  QrCode
} from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function PosterLandingPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 py-2">
      {/* Clinic QR Landing Badge */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200">
          <QrCode className="w-3.5 h-3.5 text-teal-700" />
          <span>Clinic Poster Landing Portal &bull; SmartVax India</span>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white mx-auto shadow-md">
          <Shield className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Welcome to SmartVax
        </h1>
        <p className="text-sm font-semibold text-teal-800">
          Adult Immunization Awareness System
        </p>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          You scanned this from a clinic or waiting room poster. Did you know that vaccines are not just for children? Adults also need vaccines to protect against pneumonia, shingles, Hepatitis B, cervical cancer, and tetanus.
        </p>
      </div>

      {/* Prominent Medical Disclaimer */}
      <MedicalDisclaimer compact />

      {/* Primary Action Buttons: Mobile-first & Touch-friendly */}
      <div className="space-y-3">
        <Link
          to="/vaccine-library"
          className="w-full p-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500 text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div>Explore All Adult Vaccines</div>
              <div className="text-[11px] text-teal-100 font-normal">Search by name, disease, or medical condition</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/age-groups"
          className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 text-slate-900 font-bold text-sm shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div>Explore by Age Group</div>
              <div className="text-[11px] text-slate-500 font-normal">See guidance for 18–29, 30–49, 50–64, or 65+</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-teal-600" />
        </Link>

        <Link
          to="/doctor-checklist"
          className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 text-slate-900 font-bold text-sm shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div>Doctor Visit Checklist</div>
              <div className="text-[11px] text-slate-500 font-normal">Check questions to ask the doctor during your consultation</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-teal-600" />
        </Link>

        <Link
          to="/awareness-guide"
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div>Interactive 2-Min Awareness Guide</div>
              <div className="text-[11px] text-slate-300 font-normal">Answer 4 quick questions for tailored discussion points</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Quick Fast Facts for Waiting Room Readers */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          While You Wait: Quick Vaccine Facts in India
        </h3>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span><strong>Diabetes & Lungs:</strong> Indian adults with diabetes or asthma have significantly higher pneumonia risks. Pneumococcal vaccines offer vital lung defense.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span><strong>Age 50+ Shingles:</strong> Shingles causes burning nerve pain. Recombinant shingles vaccine helps prevent chronic neuralgia.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span><strong>Lost Childhood Cards:</strong> Don't worry if you lost your old records. Doctors can use blood antibody tests or provide safe routine boosters.</span>
          </li>
        </ul>
      </div>

      {/* Link to Full Desktop Site */}
      <div className="text-center pt-2">
        <Link to="/" className="text-xs font-semibold text-teal-700 hover:text-teal-900">
          Visit Full SmartVax Homepage &rarr;
        </Link>
      </div>
    </div>
  );
}
