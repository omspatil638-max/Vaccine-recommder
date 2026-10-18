import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  BookOpen, 
  CheckCircle2, 
  Tag, 
  Layers,
  Sparkles
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import vaccinesData from '../data/vaccines.json';

export default function VaccineLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAge = searchParams.get('age') || 'all';
  const initialCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedAge, setSelectedAge] = useState(initialAge);
  const [selectedCondition, setSelectedCondition] = useState('all');

  // Sync state if URL search params change
  useEffect(() => {
    if (searchParams.get('age')) setSelectedAge(searchParams.get('age'));
    if (searchParams.get('category')) setSelectedCategory(searchParams.get('category'));
  }, [searchParams]);

  const categories = [
    'all',
    'Routine Annual',
    'High-Risk & Senior Health',
    'Routine & Pregnancy',
    'Routine & Liver Health',
    'Senior & Neurological Health',
    'Cancer Prevention & Reproductive Health',
    'Endemic & Digestive Health',
    'Critical Post-Exposure & Occupational',
    'Catch-Up & Reproductive Safety'
  ];

  const conditionsList = [
    { id: 'all', label: 'All Health Statuses' },
    { id: 'diabetes', label: 'Diabetes Mellitus' },
    { id: 'respiratory', label: 'Asthma / COPD / Lungs' },
    { id: 'cardiovascular', label: 'Heart Disease' },
    { id: 'kidney', label: 'Chronic Kidney Disease' },
    { id: 'liver', label: 'Chronic Liver Disease' },
    { id: 'pregnancy', label: 'Pregnancy & Maternity' },
    { id: 'healthcare', label: 'Healthcare Worker Exposure' }
  ];

  const filteredVaccines = useMemo(() => {
    return vaccinesData.filter((vaccine) => {
      // 1. Text Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        vaccine.name.toLowerCase().includes(query) ||
        vaccine.genericName.toLowerCase().includes(query) ||
        vaccine.prevention.toLowerCase().includes(query) ||
        vaccine.whoMayBenefit.toLowerCase().includes(query) ||
        (vaccine.tags || []).some((t) => t.toLowerCase().includes(query));

      // 2. Category filter
      const matchesCategory =
        selectedCategory === 'all' || vaccine.category === selectedCategory;

      // 3. Age filter
      const matchesAge =
        selectedAge === 'all' ||
        (vaccine.applicableAgeGroups && vaccine.applicableAgeGroups.includes(selectedAge));

      // 4. Condition filter
      const matchesCondition =
        selectedCondition === 'all' ||
        (vaccine.healthConditions && vaccine.healthConditions.includes(selectedCondition));

      return matchesSearch && matchesCategory && matchesAge && matchesCondition;
    });
  }, [searchQuery, selectedCategory, selectedAge, selectedCondition]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAge('all');
    setSelectedCondition('all');
    setSearchParams({});
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedAge !== 'all' ||
    selectedCondition !== 'all';

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Vaccine Library' }]} />
      <MedicalDisclaimer compact />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
            Verified Guideline Database &bull; India
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Adult Vaccine Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Searchable catalog of vaccines referenced in Indian adult immunization recommendations (MoHFW, NTAGI, API, WHO).
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
          Showing <strong>{filteredVaccines.length}</strong> of {vaccinesData.length} Vaccines
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by vaccine name, disease prevented (e.g. flu, cervical cancer, pneumonia, rabies)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Age Group Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Age Group
            </label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Age Groups</option>
              <option value="18-29">Ages 18–29 (Young Adults)</option>
              <option value="30-49">Ages 30–49 (Middle Adulthood)</option>
              <option value="50-64">Ages 50–64 (Pre-Seniors)</option>
              <option value="65+">Ages 65 and Older (Seniors)</option>
            </select>
          </div>

          {/* Health Condition Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Health Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-teal-500"
            >
              {conditionsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Clinical Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filter Button if active */}
        {isFiltered && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Active filters applied
            </span>
            <button
              onClick={handleResetFilters}
              className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Vaccine Cards Results */}
      {filteredVaccines.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            No vaccines match your current filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search terms or clearing selected category and health condition filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVaccines.map((v) => (
            <div
              key={v.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {v.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {v.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {v.genericName}
                  </p>
                </div>

                <div className="text-xs text-slate-700 space-y-1.5 pt-1">
                  <div>
                    <strong className="text-slate-900">What It Helps Prevent:</strong>{' '}
                    <span className="text-slate-600">{v.prevention}</span>
                  </div>
                  <div>
                    <strong className="text-slate-900">Who May Benefit:</strong>{' '}
                    <span className="text-slate-600">{v.whoMayBenefit}</span>
                  </div>
                </div>

                {/* Tags */}
                {v.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {v.tags.map((t, i) => (
                      <span key={i} className="text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Reviewed: {v.lastReviewed}
                </span>
                <Link
                  to={`/vaccine-library/${v.id}`}
                  className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 group"
                >
                  <span>Detailed Clinical Info</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
