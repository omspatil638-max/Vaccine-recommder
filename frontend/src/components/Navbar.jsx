import React from 'react';
import { Syringe, User, Calendar, LayoutDashboard, UserCheck, Shield, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'history', label: 'Vaccine History', icon: Calendar },
    { id: 'review', label: 'Clinical Review', icon: UserCheck },
    { id: 'privacy', label: 'Privacy & Rules', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-20 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_16px_35px_rgba(59,130,246,0.28)]">
              <Syringe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-base md:text-lg font-extrabold tracking-tight text-slate-900">
                ImmunoGuard
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                  <Sparkles className="h-2.5 w-2.5" />
                  v1.1
                </span>
              </div>
              <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
                Personalized immunization guidance
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 p-1.5 shadow-inner md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold transition-all md:text-sm ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="demo-badge">
              Demo data
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
