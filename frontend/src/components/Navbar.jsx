import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Menu, 
  X, 
  Users, 
  BookOpen, 
  ClipboardList, 
  HelpCircle, 
  Info, 
  HeartPulse, 
  UserCheck,
  Sparkles,
  QrCode,
  Share2,
  BellRing
} from 'lucide-react';
import ClinicPosterModal from './ClinicPosterModal';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const location = useLocation();

  const mainNavItems = [
    { to: '/', label: 'Home' },
    { to: '/age-groups', label: 'Explore by Age' },
    { to: '/mens-health', label: "Men's Health" },
    { to: '/womens-health', label: "Women's Health" },
    { to: '/health-conditions', label: 'Health Conditions' },
    { to: '/vaccine-library', label: 'Vaccine Library' },
    { to: '/awareness-guide', label: 'Awareness Guide', badge: 'Interactive' },
  ];

  const secondaryNavItems = [
    { to: '/reminders', label: 'Vaccine Update Reminders', icon: BellRing },
    { to: '/doctor-checklist', label: 'Doctor Visit Checklist', icon: ClipboardList },
    { to: '/faq', label: 'Frequently Asked Questions', icon: HelpCircle },
    { to: '/about', label: 'About SmartVax', icon: Info },
  ];

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        {/* Top Mini-Banner: India Context & Poster Action */}
        <div className="bg-teal-950/80 border-b border-teal-800/40 text-[11px] text-teal-200 py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span>Adult Immunization Awareness for India &bull; Derived from MoHFW, NTAGI & API Guidelines</span>
            </span>
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => setPosterModalOpen(true)}
                className="text-teal-200 hover:text-white font-semibold flex items-center gap-1 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-teal-300" />
                Clinic Poster & QR Code
              </button>
              <span className="text-teal-700">|</span>
              <Link to="/doctor-checklist" className="text-teal-200 hover:text-white transition-colors">
                Doctor Checklist
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group focus-visible:outline-teal-400">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  SmartVax
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded">
                    India
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Adult Immunization Awareness System
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  {item.label}
                  {item.badge && (
                    <span className="bg-coral-500 bg-orange-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}

              {/* More Dropdown (Doctor Checklist, FAQ, About) */}
              <div className="relative group pl-1">
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1"
                  aria-haspopup="true"
                >
                  <span>Tools & FAQ</span>
                  <span className="text-[10px] text-slate-400">▾</span>
                </button>
                <div className="absolute right-0 top-full pt-1 hidden group-hover:block group-focus-within:block w-56 z-50 animate-in fade-in duration-150">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-1.5 space-y-0.5 text-xs">
                    {secondaryNavItems.map((sub) => {
                      const Icon = sub.icon;
                      return (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                              isActive
                                ? 'bg-teal-600 text-white'
                                : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                            }`
                          }
                        >
                          <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                          <span>{sub.label}</span>
                        </NavLink>
                      );
                    })}
                    <div className="border-t border-slate-700/80 my-1"></div>
                    <button
                      onClick={() => setPosterModalOpen(true)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-teal-300 hover:bg-slate-700 text-left transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Clinic Poster & QR</span>
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            {/* Header Right Actions */}
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                to="/awareness-guide"
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Guide</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setPosterModalOpen(true)}
                className="p-2 text-teal-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Clinic QR Code"
                aria-label="Clinic Poster and QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-6 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
              Main Pages
            </div>
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-3 py-1 border-t border-slate-800 mt-2">
              Patient Tools & Information
            </div>
            {secondaryNavItems.map((sub) => {
              const Icon = sub.icon;
              return (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-teal-400" />
                  <span>{sub.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  closeMobile();
                  setPosterModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs rounded-xl transition-colors"
              >
                <QrCode className="w-4 h-4" />
                Clinic Poster & WhatsApp QR
              </button>
              <Link
                to="/awareness-guide"
                onClick={closeMobile}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Start Interactive Guide
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Clinic Poster QR Code Modal */}
      <ClinicPosterModal
        isOpen={posterModalOpen}
        onClose={() => setPosterModalOpen(false)}
      />
    </>
  );
}
