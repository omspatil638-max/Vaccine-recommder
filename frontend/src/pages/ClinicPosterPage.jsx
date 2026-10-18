import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Share2, Copy, Check, Shield, QrCode, ArrowLeft, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ClinicPosterPage() {
  const [copied, setCopied] = useState(false);
  
  const configured = import.meta.env.VITE_PUBLIC_SITE_URL;
  const baseUrl = configured && configured.trim() !== ''
    ? configured.trim()
    : typeof window !== 'undefined' ? window.location.origin : 'https://smartvax.india.health';

  const landingUrl = `${baseUrl}/poster-landing`;
  const whatsappMessage = `Download or print this SmartVax adult immunization awareness poster for your clinic waiting room: ${landingUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(landingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <Breadcrumbs items={[{ label: 'Clinic Poster Generator' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Printable Clinic Awareness Poster
            </h1>
            <p className="text-xs text-slate-500">
              High-resolution A4 waiting room poster connecting patients to SmartVax via QR code.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Poster</span>
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* The Printable Poster Container */}
      <div
        id="a4-poster"
        className="max-w-2xl mx-auto bg-white border-2 border-slate-900 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8 text-center text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Poster Top Brand */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            SmartVax India
          </span>
        </div>

        {/* Catchy Main Heading */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded-full border border-amber-300">
            Public Health Awareness
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Did You Know?<br />
            <span className="text-teal-700">Vaccines Aren't Just for Children.</span>
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto font-medium">
            Adults also need protection against pneumonia, shingles, Hepatitis B, cervical cancer, seasonal flu, and tetanus.
          </p>
        </div>

        {/* High-Contrast QR Code */}
        <div className="bg-slate-50 border-2 border-dashed border-teal-400 rounded-3xl p-6 inline-block shadow-xs">
          <div className="bg-white p-4 rounded-2xl shadow-sm inline-block">
            <QRCodeSVG
              value={landingUrl}
              size={210}
              level="H"
              includeMargin={true}
              fgColor="#0F172A"
              bgColor="#FFFFFF"
            />
          </div>
          <div className="mt-3 font-extrabold text-sm text-slate-900">
            Scan with your Phone Camera
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Explore vaccines relevant to your age & health status
          </p>
          <div className="mt-2 text-[11px] font-mono text-slate-500 font-semibold select-all break-all">
            {landingUrl}
          </div>
        </div>

        {/* Key Health Bullets for Waiting Room Patients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs bg-teal-50/60 border border-teal-200/80 rounded-2xl p-5">
          <div>
            <strong className="text-slate-900 block font-bold mb-1">
              • Diabetics & Lung Conditions:
            </strong>
            <span className="text-slate-700">
              3–4x higher risk of severe pneumonia. Ask about Pneumococcal & Flu shots.
            </span>
          </div>
          <div>
            <strong className="text-slate-900 block font-bold mb-1">
              • Adults Aged 50 & Above:
            </strong>
            <span className="text-slate-700">
              Shingles causes debilitating nerve pain. Ask your doctor about Shingles vaccination.
            </span>
          </div>
          <div>
            <strong className="text-slate-900 block font-bold mb-1">
              • Pregnancy (Weeks 27–36):
            </strong>
            <span className="text-slate-700">
              Tdap transfers protective whooping cough antibodies to your newborn baby.
            </span>
          </div>
          <div>
            <strong className="text-slate-900 block font-bold mb-1">
              • Young Adults (HPV & Hep B):
            </strong>
            <span className="text-slate-700">
              HPV vaccine prevents cervical cancer; Hepatitis B prevents chronic liver disease.
            </span>
          </div>
        </div>

        {/* Footer Attribution on Poster */}
        <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            Guideline Citations: Ministry of Health & Family Welfare (MoHFW) &bull; Association of Physicians of India (API) &bull; WHO India
          </p>
          <p className="text-[10px] text-slate-400">
            Educational decision support only &bull; Consult your doctor (MBBS/MD) for clinical assessment and prescriptions.
          </p>
        </div>
      </div>
    </div>
  );
}
