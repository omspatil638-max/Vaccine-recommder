import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode } from 'lucide-react';

export default function Footer({ onOpenPoster }) {
  return <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-300">
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div><Link to="/" className="text-base font-semibold tracking-tight text-white">SmartVax <span className="text-blue-300">India</span></Link><p className="mt-3 max-w-md text-sm leading-6 text-slate-400">A public information resource to help adults prepare better questions about vaccination with a qualified healthcare professional.</p></div>
        <div><h2 className="text-sm font-semibold text-white">Explore</h2><ul className="mt-3 space-y-2 text-sm"><li><Link to="/awareness-guide" className="hover:text-white">Guided check</Link></li><li><Link to="/vaccine-library" className="hover:text-white">Vaccine library</Link></li><li><Link to="/age-groups" className="hover:text-white">Browse by age</Link></li><li><Link to="/health-conditions" className="hover:text-white">Health situations</Link></li></ul></div>
        <div><h2 className="text-sm font-semibold text-white">More information</h2><ul className="mt-3 space-y-2 text-sm"><li><Link to="/doctor-checklist" className="hover:text-white">Doctor visit checklist</Link></li><li><Link to="/about" className="hover:text-white">About and sources</Link></li><li><Link to="/faq" className="hover:text-white">Frequently asked questions</Link></li>{onOpenPoster && <li><button onClick={onOpenPoster} className="inline-flex items-center gap-2 text-left hover:text-white"><QrCode className="h-4 w-4" aria-hidden="true" />Clinic poster and QR</button></li>}</ul></div>
      </div>
      <div className="mt-8 border-t border-slate-800 pt-5 text-xs leading-5 text-slate-400"><p>Educational information only. This site does not diagnose, prescribe, or determine your individual eligibility for vaccination. Discuss your health history and vaccine choices with a qualified healthcare professional.</p><div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} SmartVax India</span><Link to="/privacy" className="hover:text-white">Privacy</Link></div></div>
    </div>
  </footer>;
}
