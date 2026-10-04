import React, { useState } from "react";
import { FaHeartbeat, FaTimes, FaSearch } from "react-icons/fa";

export default function MedicalHistoryPopup({ patient, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!patient) return null;

  // Safe extractions for dynamic backend payloads
  const historyList = patient.history || patient.medicalHistory || [];
  const surgeriesList = patient.surgeries || [];
  const allergiesList = patient.allergies || [];

  const filteredHistory = historyList.filter(h =>
    (h.diagnosis || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-800 text-white p-6 flex justify-between items-center rounded-t-2xl border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="text-3xl text-emerald-400"><FaHeartbeat /></div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight uppercase">Patient Medical History</h3>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-0.5">Complete record of past diagnoses, surgeries, and allergies</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl p-2 cursor-pointer transition-colors rounded-xl hover:bg-white/5">
            <FaTimes />
          </button>
        </div>

        <div className="p-8 space-y-8 bg-slate-50/50 flex-1 w-full">
          {/* Patient Overview Details */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6 shadow-xs w-full">
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1">Patient Name</span>
              <span className="text-lg text-slate-900 font-bold tracking-tight">{patient.fullName || patient.name || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1">Gender</span>
              <span className="text-lg text-slate-900 font-bold tracking-tight">{patient.gender || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1">Blood Type</span>
              <span className="text-lg text-rose-600 font-bold tracking-tight">{patient.bloodGroup || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1">Date of Birth</span>
              <span className="text-lg text-slate-900 font-medium tracking-tight">
                {patient.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 text-lg"><FaSearch /></span>
            <input 
              type="text"
              placeholder="Search past diagnoses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white rounded-xl border-2 border-slate-200 pl-12 pr-4 py-3 text-base font-medium text-slate-900 outline-none focus:border-emerald-600 transition-colors placeholder-slate-400"
            />
          </div>

          {/* Diagnoses Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest">
                  <th className="p-4 pl-6">Diagnosis / Illness</th>
                  <th className="p-4">Doctor Name</th>
                  <th className="p-4 pr-6 text-right">Date Visited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-base font-medium text-slate-600">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-slate-400">No matching medical records found.</td>
                  </tr>
                ) : (
                  filteredHistory.map((h, i) => (
                    <tr key={h._id || i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6 text-slate-900 font-bold tracking-tight">{h.diagnosis || "Unspecified"}</td>
                      <td className="p-4 text-slate-700">{h.doctor || "General Doctor"}</td>
                      <td className="p-4 pr-6 text-right text-sm text-slate-400">{h.date || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Surgeries & Allergies Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
                🩺 Past Surgeries & Operations
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {surgeriesList.length === 0 ? (
                  <p className="text-xs text-slate-400">No past surgeries reported.</p>
                ) : (
                  surgeriesList.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-start border-b border-dashed border-slate-100 pb-3 last:border-0">
                      <div>
                        <span className="font-bold text-slate-900 block text-base tracking-tight">{s.name || s.procedure}</span>
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{s.doctor || "Surgeon"}</span>
                      </div>
                      <span className="font-medium text-sm text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">{s.date || "N/A"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
              <h4 className="font-bold text-rose-700 text-base flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
                ⚠️ Allergies & Drug Reactions
              </h4>
              <div className="flex flex-wrap gap-2.5 max-h-48 overflow-y-auto">
                {allergiesList.length === 0 ? (
                  <p className="text-xs text-slate-400">No known allergies reported.</p>
                ) : (
                  allergiesList.map((allergy, idx) => (
                    <span key={idx} className="bg-rose-50 border border-rose-200 text-rose-700 font-bold px-4 py-2 rounded-xl text-xs tracking-wider uppercase shadow-xs">
                      ⚠️ {typeof allergy === 'string' ? allergy : allergy.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}