import React, { useState } from 'react';
import { 
  Shield, 
  Heart, 
  Users, 
  QrCode, 
  Share2, 
  Lock, 
  ExternalLink, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  Printer
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import ClinicPosterModal from '../components/ClinicPosterModal';

export default function AboutPage() {
  const [posterModalOpen, setPosterModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'About SmartVax' }]} />
      <MedicalDisclaimer compact />

      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
          About the Public Health Initiative
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1.5">
          About SmartVax India
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          SmartVax is an educational decision-support platform designed to improve adult immunization awareness across India.
        </p>
      </div>

      {/* Mission & Background */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-600" />
          The Adult Vaccination Awareness Gap in India
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          India has achieved historic success in childhood immunization through the Universal Immunization Programme (UIP) and Mission Indradhanush. However, adult immunization awareness remains remarkably low. Over 80% of adults believe vaccines end after childhood.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Adults continue to suffer preventable morbidity and mortality from pneumococcal pneumonia (especially in seniors and diabetics), cervical cancer (HPV), acute and chronic Hepatitis B, shingles nerve pain, seasonal influenza, and tetanus. SmartVax was created to provide reliable, accessible information so citizens can ask informed questions during routine clinical check-ups.
        </p>
      </div>

      {/* 4 Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            1. Evidence-Based Indian Guidelines
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All content strictly reflects published guidance from the Ministry of Health & Family Welfare (MoHFW), the Association of Physicians of India (API), and WHO India. No medical claims are invented.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            2. Privacy by Design (Zero Data Collection)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            SmartVax does not require account creation, login, names, phone numbers, or Aadhaar details. Questionnaire answers exist only in temporary browser memory and are never transmitted to any server.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            3. Decision Support, Not Autonomous Diagnosis
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            SmartVax does not prescribe medications or autonomously certify eligibility. It organizes relevant discussion points so you can have an informed, productive conversation with an MBBS/MD doctor.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            4. Clinic Waiting Room Integration
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Clinics, hospitals, and pharmacies can print high-contrast QR posters. Patients waiting in reception or OPD areas scan the code to read vaccine awareness topics before entering the doctor's cabin.
          </p>
        </div>
      </div>

      {/* Clinic Poster & QR Strategy Box */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300">
            For Clinics, Doctors & Public Health Workers
          </span>
          <h3 className="text-xl font-bold text-white">
            Generate a Clinic Poster QR Code
          </h3>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Display SmartVax QR codes in your waiting room. Patients can review questions regarding diabetes, age-specific vaccines, and pregnancy immunity while waiting.
          </p>
        </div>
        <button
          onClick={() => setPosterModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <QrCode className="w-4 h-4" />
          <span>Open Poster & WhatsApp Share Tool</span>
        </button>
      </div>

      {/* Reference Organizations */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Official Indian Guideline References
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Ministry of Health and Family Welfare (MoHFW), Govt. of India</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>National Technical Advisory Group on Immunization (NTAGI)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Association of Physicians of India (API) Adult Immunization Consensus</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>World Health Organization (WHO) Country Office for India</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Federation of Obstetric and Gynaecological Societies of India (FOGSI)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Research Society for the Study of Diabetes in India (RSSDI)</span>
          </li>
        </ul>
      </div>

      {/* Global Clinic Poster QR Code Modal */}
      <ClinicPosterModal
        isOpen={posterModalOpen}
        onClose={() => setPosterModalOpen(false)}
      />
    </div>
  );
}
