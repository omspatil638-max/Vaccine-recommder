import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, QrCode, FileText, ExternalLink, Heart, CheckCircle2 } from 'lucide-react';

export default function Footer({ onOpenPoster }) {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs mt-auto">
      {/* Upper Footer Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: SmartVax Mission */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">SmartVax India</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Empowering adults across India with transparent, verified information on vaccines relevant to age, health conditions, and personal circumstances. Bridging the adult awareness gap for informed doctor conversations.
            </p>
            <div className="pt-2 flex items-center gap-2 text-teal-400">
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                Zero Trackers &bull; Zero Real PII
              </span>
            </div>
          </div>

          {/* Col 2: Explore Navigation */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3 uppercase tracking-wider text-[11px]">
              Explore Vaccines
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/age-groups" className="hover:text-teal-300 transition-colors">
                  Explore by Age (18–65+)
                </Link>
              </li>
              <li>
                <Link to="/mens-health" className="hover:text-teal-300 transition-colors">
                  Men's Health Priorities
                </Link>
              </li>
              <li>
                <Link to="/womens-health" className="hover:text-teal-300 transition-colors">
                  Women's Health & HPV
                </Link>
              </li>
              <li>
                <Link to="/health-conditions" className="hover:text-teal-300 transition-colors">
                  Health Conditions (Diabetes/Lungs)
                </Link>
              </li>
              <li>
                <Link to="/vaccine-library" className="hover:text-teal-300 transition-colors">
                  Full Vaccine Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tools & Resources */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3 uppercase tracking-wider text-[11px]">
              Patient Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/reminders" className="hover:text-teal-300 transition-colors">
                  Vaccine Update Reminders
                </Link>
              </li>
              <li>
                <Link to="/awareness-guide" className="hover:text-teal-300 transition-colors">
                  Awareness Guide Questionnaire
                </Link>
              </li>
              <li>
                <Link to="/doctor-checklist" className="hover:text-teal-300 transition-colors">
                  Doctor Visit Checklist
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-teal-300 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">
                  About SmartVax
                </Link>
              </li>
              {onOpenPoster && (
                <li>
                  <button
                    onClick={onOpenPoster}
                    className="hover:text-teal-300 transition-colors text-left flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Clinic Poster & QR Code
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Verified Guidance Sources */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3 uppercase tracking-wider text-[11px]">
              Verified Guidance
            </h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span>MoHFW (Govt. of India)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>NTAGI India Working Groups</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>Association of Physicians of India</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>WHO India Country Office</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>FOGSI Clinical Guidelines</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer Banner in Footer */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-[11px] leading-relaxed text-slate-400">
          <p className="mb-2">
            <strong className="text-slate-300">Medical Decision Support Disclaimer:</strong> SmartVax provides educational information to empower adult health literacy in India. It does not provide medical diagnosis, individual clinical eligibility, or medical prescriptions. Always review vaccine options with a registered medical practitioner (MBBS/MD) before receiving any immunization.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-slate-800/60 text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} SmartVax India &bull; Free, Public Health Educational Resource.
            </div>
            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-slate-300">About SmartVax</Link>
              <span>&bull;</span>
              <Link to="/faq" className="hover:text-slate-300">FAQ</Link>
              <span>&bull;</span>
              <Link to="/doctor-checklist" className="hover:text-slate-300">Doctor Checklist</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
