import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  IndianRupee,
  Building2,
  Stethoscope,
  Navigation,
  Search,
  ExternalLink,
  Syringe,
  Landmark,
  Store,
  Info,
  ArrowRight,
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import vaccines from '../data/vaccines.json';
import { costFor, COST_DISCLAIMER } from '../data/vaccineCosts';

function shortName(v) {
  return v.name.replace(/\s*\([^)]*\)/g, '').replace(/\s*Vaccine$/i, '').trim() || v.name;
}

const CENTER_TYPES = [
  {
    icon: Landmark,
    title: 'Government hospitals & PHCs',
    detail:
      'District hospitals, Community Health Centres (CHC) and Primary Health Centres (PHC). Often lowest cost or free for eligible groups and programmes (e.g. Td in pregnancy, rabies post-exposure).',
  },
  {
    icon: Building2,
    title: 'Private hospitals',
    detail:
      'Most multispeciality and corporate hospitals run adult immunisation / travel-vaccine clinics with the widest brand choice. Self-pay.',
  },
  {
    icon: Stethoscope,
    title: 'Clinics & GPs',
    detail:
      'Many physicians and paediatric/family clinics stock common adult vaccines. Call ahead to confirm the exact brand and that it is in stock.',
  },
  {
    icon: Store,
    title: 'Pharmacies & travel clinics',
    detail:
      'Larger pharmacy chains and dedicated travel clinics carry influenza, typhoid, hepatitis and travel vaccines. Good for quick single doses.',
  },
];

export default function VaccineFinderPage() {
  const [params] = useSearchParams();
  const preselected = params.get('vaccine');
  const [selectedId, setSelectedId] = useState(
    vaccines.some((v) => v.id === preselected) ? preselected : vaccines[0]?.id || '',
  );
  const [city, setCity] = useState('');
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | locating | error

  const selected = useMemo(() => vaccines.find((v) => v.id === selectedId), [selectedId]);
  const cost = selected ? costFor(selected.id) : null;
  const sName = selected ? shortName(selected) : '';

  const mapsSearch = (query) =>
    `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

  const findNearMe = () => {
    const query = `${sName} vaccination centre near me`;
    if (!navigator.geolocation) {
      window.open(mapsSearch(query), '_blank', 'noopener');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoStatus('idle');
        const { latitude, longitude } = pos.coords;
        // Google Maps centres the search on these coordinates.
        window.open(
          `https://www.google.com/maps/search/${encodeURIComponent(`${sName} vaccination centre`)}/@${latitude},${longitude},13z`,
          '_blank',
          'noopener',
        );
      },
      () => {
        setGeoStatus('error');
        window.open(mapsSearch(query), '_blank', 'noopener');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  const findInCity = () => {
    const place = city.trim();
    const query = place ? `${sName} vaccination centre in ${place}` : `${sName} vaccination centre near me`;
    window.open(mapsSearch(query), '_blank', 'noopener');
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Vaccine Finder' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white px-6 sm:px-10 py-10 sm:py-14">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-200 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5" />
            Find where to get vaccinated in India
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Where can I get this vaccine — and what does it cost?
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Pick a vaccine to see an indicative cost and where it’s usually available, then find real
            centres near you on the map. Stock and price change often, so always call ahead to confirm.
          </p>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Left: selector + cost + find */}
        <div className="lg:col-span-3 space-y-6">
          {/* Vaccine selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <label htmlFor="vf-vaccine" className="block text-sm font-semibold text-slate-800 mb-2">
              1. Choose a vaccine
            </label>
            <div className="relative">
              <Syringe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
              <select
                id="vf-vaccine"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                {vaccines.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Protects against {selected.prevention}{' '}
                <Link
                  to={`/vaccine-library/${selected.id}`}
                  className="inline-flex items-center gap-0.5 font-semibold text-blue-700 hover:text-blue-800"
                >
                  Full details <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            )}
          </div>

          {/* Cost card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-slate-900">Indicative cost for {sName}</h2>
            </div>
            {cost ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Private (per dose)</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">{cost.privateRange}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Government</p>
                  <p className="mt-1 text-sm text-slate-700 leading-snug">{cost.govt}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Cost information isn’t available for this vaccine yet.</p>
            )}
            <p className="mt-4 flex items-start gap-1.5 text-[11px] text-slate-500 leading-relaxed">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {COST_DISCLAIMER}
            </p>
          </div>

          {/* Find centres */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-bold text-slate-900 mb-1">2. Find centres near you</h2>
            <p className="text-xs text-slate-600 mb-4">
              Opens live results in Google Maps for “{sName} vaccination centre”, so you see real,
              currently-listed centres with directions, phone numbers and reviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={findNearMe}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Navigation className="h-4 w-4" />
                {geoStatus === 'locating' ? 'Locating…' : 'Use my location'}
              </button>
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && findInCity()}
                  placeholder="or enter a city / area"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <button
                  onClick={findInCity}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
            {geoStatus === 'error' && (
              <p className="mt-2 text-xs text-slate-500">
                Couldn’t get your location — opened a general search instead. You can type your city above.
              </p>
            )}

            {/* Official portals */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">Official government portals</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.cowin.gov.in/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700"
                >
                  CoWIN <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://nha.gov.in/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700"
                >
                  National Health Authority <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: where it's available */}
        <aside className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900 mb-4">Where adult vaccines are given in India</h2>
            <ul className="space-y-4">
              {CENTER_TYPES.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{c.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{c.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Before you go: call the centre to confirm the <strong>exact brand</strong>, that it’s{' '}
              <strong>in stock</strong>, the <strong>price</strong>, and whether you need an appointment.
              Carry a photo ID and any past vaccination records.
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-10">
        <MedicalDisclaimer compact />
      </div>
    </div>
  );
}
