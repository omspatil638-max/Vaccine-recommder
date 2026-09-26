import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, HelpCircle, FileText, Syringe } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function HistoryPage({ historyList, onAddRecord, onDeleteRecord }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vaccineCode: 'TDAP',
    vaccineName: 'Tetanus, Diphtheria, Acellular Pertussis (Tdap)',
    doseNumber: 1,
    administrationDate: '',
    status: 'completed',
    notes: ''
  });

  const vaccineCatalog = [
    { code: 'TDAP', name: 'Tetanus, Diphtheria, Acellular Pertussis (Tdap)' },
    { code: 'COVID19_mRNA', name: 'COVID-19 mRNA (Spikevax / Comirnaty)' },
    { code: 'INFLUENZA_SEASONAL', name: 'Seasonal Influenza (Inactivated / Recombinant)' },
    { code: 'MMR', name: 'Measles, Mumps, Rubella (MMR)' },
    { code: 'HEP_B', name: 'Hepatitis B' },
    { code: 'PNEUMOCOCCAL_PCV20', name: 'Pneumococcal Conjugate (PCV20)' },
    { code: 'YELLOW_FEVER', name: 'Yellow Fever Vaccine (Stamaril)' },
    { code: 'VARICELLA', name: 'Varicella (Chickenpox)' }
  ];

  const handleVaccineSelect = (e) => {
    const code = e.target.value;
    const selected = vaccineCatalog.find((v) => v.code === code);
    setFormData((prev) => ({
      ...prev,
      vaccineCode: code,
      vaccineName: selected ? selected.name : code
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      id: `HIST-${Date.now()}`,
      ...formData,
      doseNumber: Number(formData.doseNumber)
    };
    onAddRecord(newRecord);
    setShowAddForm(false);
    setFormData({
      vaccineCode: 'TDAP',
      vaccineName: 'Tetanus, Diphtheria, Acellular Pertussis (Tdap)',
      doseNumber: 1,
      administrationDate: '',
      status: 'completed',
      notes: ''
    });
  };

  // Sort history chronologically (newest first or oldest first)
  const sortedHistory = [...historyList].sort((a, b) => {
    if (!a.administrationDate) return 1;
    if (!b.administrationDate) return -1;
    return new Date(b.administrationDate) - new Date(a.administrationDate);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <MedicalDisclaimer compact />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Vaccination History Timeline
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chronological immunization history. Incomplete records are safely flagged as "Unknown" rather than negative.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add History Record'}
          </button>
        </div>

        {/* Add Record Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Syringe className="w-4 h-4 text-blue-600" />
              Record New Immunization Dose
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Vaccine Target</label>
                <select
                  value={formData.vaccineCode}
                  onChange={handleVaccineSelect}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {vaccineCatalog.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dose Number</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.doseNumber}
                  onChange={(e) => setFormData({ ...formData, doseNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Administration Date (If Known)</label>
                <input
                  type="date"
                  value={formData.administrationDate}
                  onChange={(e) => setFormData({ ...formData, administrationDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Record Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="completed">Completed Verified</option>
                  <option value="partial">Partial Series</option>
                  <option value="unknown">Unknown — Vaccination Record Unavailable</option>
                  <option value="unavailable">Record Unavailable at Facility</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Clinical Notes / Provider Remarks</label>
              <input
                type="text"
                placeholder="e.g. Received at CVS Pharmacy, Lot #AB-9214"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
              >
                Save Record
              </button>
            </div>
          </form>
        )}

        {/* Timeline View */}
        {sortedHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <HelpCircle className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="font-semibold text-sm">No Vaccination History Logged</p>
            <p className="text-xs text-gray-400 mt-1">
              Add past immunizations or leave unlogged for system to safely mark as "Unknown — record unavailable".
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-blue-200 ml-4 space-y-6">
            {sortedHistory.map((item) => {
              const isUnknown = item.status === 'unknown' || item.status === 'unavailable';
              return (
                <div key={item.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center ${
                      isUnknown ? 'border-purple-500 text-purple-600' : 'border-blue-600 text-blue-600'
                    }`}
                  >
                    {isUnknown ? <HelpCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm md:text-base">
                          {item.vaccineName}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-mono font-medium">
                          Dose #{item.doseNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>
                          <strong>Admin Date:</strong> {item.administrationDate || 'Unknown / Unrecorded'}
                        </span>
                        <span>&bull;</span>
                        <span>
                          <strong>Status:</strong>{' '}
                          <span
                            className={
                              isUnknown
                                ? 'text-purple-700 font-bold'
                                : item.status === 'completed'
                                ? 'text-emerald-700 font-bold'
                                : 'text-amber-700 font-bold'
                            }
                          >
                            {isUnknown
                              ? 'Unknown — vaccination record unavailable'
                              : item.status.toUpperCase()}
                          </span>
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-gray-600 italic mt-2 bg-gray-50 p-2 rounded">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteRecord(item.id)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 self-end sm:self-center transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
