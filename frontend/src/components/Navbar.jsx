import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, ChevronDown, Menu, QrCode, ShieldCheck, X } from 'lucide-react';
import ClinicPosterModal from './ClinicPosterModal';

const primary = [
  { to: '/', label: 'Home', end: true },
  { to: '/awareness-guide', label: 'Guided check' },
  { to: '/vaccine-library', label: 'Vaccine library' },
  { to: '/age-groups', label: 'By age' },
  { to: '/health-conditions', label: 'Health situations' },
];
const more = [
  { to: '/doctor-checklist', label: 'Doctor visit checklist' },
  { to: '/mens-health', label: "Men's health" },
  { to: '/womens-health', label: "Women's health" },
  { to: '/reminders', label: 'Vaccine update reminders' },
  { to: '/faq', label: 'Frequently asked questions' },
  { to: '/about', label: 'About this guide' },
];
const linkClass = ({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`;

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const closeMobile = () => setMobileMenuOpen(false);

  return <>
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMobile} className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300" aria-label="SmartVax India home">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
          <span><span className="block text-base font-semibold tracking-tight">SmartVax <span className="text-blue-300">India</span></span><span className="hidden text-xs text-slate-400 sm:block">Adult vaccine information</span></span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
          {primary.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>{item.label}</NavLink>)}
          <div className="group relative">
            <button type="button" className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300" aria-haspopup="true">More <ChevronDown className="h-4 w-4" aria-hidden="true" /></button>
            <div className="invisible absolute right-0 top-full z-50 w-64 translate-y-1 rounded-lg border border-slate-700 bg-slate-900 p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {more.map((item) => <NavLink key={item.to} to={item.to} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-white">{item.label}</NavLink>)}
              <button type="button" onClick={() => setPosterModalOpen(true)} className="flex w-full items-center gap-2 rounded-md border-t border-slate-700 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"><QrCode className="h-4 w-4" aria-hidden="true" />Clinic poster and QR</button>
            </div>
          </div>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link to="/login" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10">Sign in</Link>
          <Link to="/signup" className="rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400">Create account</Link>
        </div>
        <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300 xl:hidden" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {mobileMenuOpen && <nav className="border-t border-slate-800 bg-slate-950 px-4 py-3 xl:hidden" aria-label="Mobile navigation"><div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">{[...primary, ...more].map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={closeMobile} className="rounded-md px-3 py-3 text-sm font-medium text-slate-200 hover:bg-white/10">{item.label}</NavLink>)}<Link to="/login" onClick={closeMobile} className="rounded-md px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10">Sign in</Link><Link to="/signup" onClick={closeMobile} className="rounded-md bg-blue-500 px-3 py-3 text-sm font-semibold text-white">Create patient account</Link><button type="button" onClick={() => { closeMobile(); setPosterModalOpen(true); }} className="flex items-center gap-2 rounded-md px-3 py-3 text-left text-sm font-medium text-slate-200 hover:bg-white/10"><QrCode className="h-4 w-4" aria-hidden="true" />Clinic poster and QR</button><Link to="/doctor-checklist" onClick={closeMobile} className="flex items-center gap-2 rounded-md bg-blue-500 px-3 py-3 text-sm font-semibold text-white"><BookOpen className="h-4 w-4" aria-hidden="true" />Prepare for a visit</Link></div></nav>}
    </header>
    <ClinicPosterModal isOpen={posterModalOpen} onClose={() => setPosterModalOpen(false)} />
  </>;
}
