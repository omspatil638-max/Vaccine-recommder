import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Share2, Printer, Copy, Check, MessageCircle, ExternalLink, QrCode } from 'lucide-react';

export default function ClinicPosterModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [targetUrl, setTargetUrl] = useState(() => {
    // Configurable site URL using environment variable VITE_PUBLIC_SITE_URL or fallback to current origin
    const configured = import.meta.env.VITE_PUBLIC_SITE_URL;
    if (configured && configured.trim() !== '') {
      return configured.trim();
    }
    return typeof window !== 'undefined' ? window.location.origin : 'https://smartvax.india.health';
  });

  if (!isOpen) return null;

  const whatsappMessage = `Learn more about adult vaccination awareness with SmartVax. Explore reliable information and prepare questions for your healthcare professional: ${targetUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-3 text-teal-700">
          <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Clinic Poster & QR Code</h3>
            <p className="text-xs text-slate-500">Connect patients to adult immunization awareness</p>
          </div>
        </div>

        {/* QR Code Container for Printing */}
        <div id="printable-clinic-poster" className="bg-slate-50 border-2 border-dashed border-teal-300 rounded-xl p-5 text-center my-4">
          <div className="inline-block bg-white p-4 rounded-xl shadow-xs border border-slate-200">
            <QRCodeSVG
              value={targetUrl}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#0F172A"
              bgColor="#FFFFFF"
            />
          </div>
          <h4 className="mt-3 font-bold text-slate-900 text-sm">
            Scan with your Phone Camera
          </h4>
          <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
            Explore adult vaccines relevant to your age & health conditions on <strong>SmartVax</strong>.
          </p>
          <div className="mt-2.5 px-3 py-1 bg-white border border-slate-300 rounded-md text-xs font-mono text-slate-700 select-all break-all inline-block">
            {targetUrl}
          </div>
        </div>

        {/* Public URL Config Notice */}
        <div className="text-xs text-slate-600 bg-teal-50 border border-teal-200 p-3 rounded-lg space-y-1 mb-4">
          <div className="font-semibold text-teal-900 flex items-center justify-between">
            <span>Configured Public Site URL:</span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-teal-800/90 leading-relaxed">
            Set <code className="bg-teal-100 px-1 rounded">VITE_PUBLIC_SITE_URL</code> in your deployment environment (e.g. Netlify/Vercel) to point QR codes directly to your live production domain.
          </p>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {/* WhatsApp Share Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </a>

          {/* Full Poster Page Button */}
          <a
            href="/clinic-poster"
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            View Printable A4 Poster
          </a>
        </div>

        {/* Poster Guidance Note */}
        <p className="text-[11px] text-slate-400 text-center mt-4">
          Clinics can display this QR code at reception desks, OPD waiting areas, and pharmacy counters to promote proactive doctor discussions.
        </p>
      </div>
    </div>
  );
}
