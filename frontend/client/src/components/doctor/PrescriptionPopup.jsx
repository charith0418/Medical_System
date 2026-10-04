import React, { useState } from "react";
import { Search, Pill, X } from "lucide-react";

export default function PrescriptionPopup({ patient, prescription, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRxIndex, setSelectedRxIndex] = useState(0);

  // 1. Extract raw list supporting both individual prescription or full patient object
  const rawList = prescription
    ? [prescription]
    : patient?.prescriptions || patient?.medications || [];

  // 2. Filter prescriptions based on search term
  const filteredPrescriptions = rawList.filter((item) => {
    const rxId = item._id || item.id || item.prescriptionId || "";
    const doctor = item.orderedBy || item.doctorName || item.doctor || "";
    const diagnosis = item.diagnosis || "";

    return (
      rxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Safe fallback for currently selected prescription object
  const selectedRx = filteredPrescriptions[selectedRxIndex] || rawList[0] || null;

  // 3. Extract array of medicines (handles nested arrays as well as direct medicine objects)
  const medicinesList = selectedRx
    ? selectedRx.medications ||
      selectedRx.medicines ||
      selectedRx.prescriptions ||
      selectedRx.items ||
      selectedRx.drugs ||
      (selectedRx.medicineName || selectedRx.name ? [selectedRx] : [])
    : [];

  // Safe fallbacks for metadata
  const doctorName =
    selectedRx?.orderedBy ||
    selectedRx?.doctorName ||
    selectedRx?.doctor ||
    "Dr. N. Silva";

  const hospitalName =
    selectedRx?.hospital ||
    selectedRx?.hospitalName ||
    selectedRx?.clinic ||
    "Smart Hospital";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <Pill size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold uppercase tracking-wider text-white">
                Medication History
              </h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                List of Active and Past Prescriptions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Prescription Number, Doctor, or Diagnosis..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedRxIndex(0); // Reset selection when searching to avoid index out-of-bounds
              }}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {selectedRx ? (
            <div className="space-y-6">
              
              {/* Rx Card Header Details */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <h4 className="text-base font-bold text-white tracking-wide">
                      Prescription {selectedRx.prescriptionId || selectedRx._id || selectedRx.id || "N/A"}
                    </h4>
                  </div>
                  <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700 font-mono">
                    {selectedRx.dateIssued
                      ? new Date(selectedRx.dateIssued).toLocaleDateString()
                      : selectedRx.date || "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mt-4 pt-4 border-t border-slate-700/40">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Ordered By
                    </span>
                    <span className="font-bold text-white text-sm">
                      {doctorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Hospital / Clinic
                    </span>
                    <span className="font-bold text-white text-sm">
                      {hospitalName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Prescribed For
                    </span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {selectedRx.diagnosis || "General Consultation"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medicines Table */}
              <div className="bg-slate-800/30 border border-slate-700/60 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Medicine Name</th>
                      <th className="p-4">Dose / Amount</th>
                      <th className="p-4">How Often (Frequency)</th>
                      <th className="p-4">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40 text-slate-200">
                    {medicinesList.length > 0 ? (
                      medicinesList.map((med, idx) => (
                        <tr key={med._id || idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white">
                            {med.medicineName || med.name || med.drug || "N/A"}
                          </td>
                          <td className="p-4">
                            {med.dosage || med.dose || med.amount || "N/A"}
                          </td>
                          <td className="p-4">
                            {med.frequency || "As Directed"}
                          </td>
                          <td className="p-4 text-emerald-400 font-medium">
                            {med.duration || "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-8 text-center text-slate-400 font-medium italic"
                        >
                          No medicines listed in this prescription.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-medium">
              No prescriptions found matching your search.
            </div>
          )}

          {/* Rx Selection Tabs */}
          {filteredPrescriptions.length > 1 && (
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                Select a Prescription to View ({filteredPrescriptions.length})
              </span>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {filteredPrescriptions.map((rx, idx) => (
                  <button
                    key={rx._id || idx}
                    onClick={() => setSelectedRxIndex(idx)}
                    className={`px-4 py-3 rounded-xl border text-xs font-medium shrink-0 flex items-center gap-3 transition-all cursor-pointer ${
                      selectedRxIndex === idx
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold">
                        ID: {rx.prescriptionId || rx._id || rx.id || `Rx #${idx + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Date: {rx.dateIssued ? new Date(rx.dateIssued).toLocaleDateString() : rx.date || "N/A"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}