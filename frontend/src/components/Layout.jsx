import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ClinicPosterModal from './ClinicPosterModal';

export default function Layout() {
  const [posterModalOpen, setPosterModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <a href="#main-content" className="sr-only z-50 rounded bg-white px-4 py-2 text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <Navbar />
      <main id="main-content" className="site-main mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Outlet />
      </main>
      <Footer onOpenPoster={() => setPosterModalOpen(true)} />
      <ClinicPosterModal
        isOpen={posterModalOpen}
        onClose={() => setPosterModalOpen(false)}
      />
    </div>
  );
}
