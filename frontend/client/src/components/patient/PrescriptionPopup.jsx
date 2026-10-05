import React, { useState } from "react";
import { FaPills, FaTimes, FaSearch, FaEye } from "react-icons/fa";

export default function PrescriptionPopup({
  patient = {},
  user = {},
  prescriptions = [],
  medications = [],
  onClose,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeUser = Object.keys(patient).length > 0 ? patient : user;

  // Resolve prescriptions list safely
  const rawList =
    (Array.isArray(prescriptions) && prescriptions.length > 0 ? prescriptions : null) ||
    (Array.isArray(medications) && medications.length > 0 ? medications : null) ||
    (Array.isArray(activeUser?.prescriptions) && activeUser.prescriptions.length > 0 ? activeUser.prescriptions : null) ||
    (Array.isArray(activeUser?.medications) ? activeUser.medications : []);

  // Filter list based on search
  const filteredPrescriptions = rawList.filter((item) => {
    const medName = (item.medicineName || item.name || item.drug || "").toLowerCase();
    const doc = (item.doctorName || item.prescribedBy || item.doctor || "").toLowerCase();
    const diag = (item.diagnosis || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return medName.includes(query) || doc.includes(query) || diag.includes(query);
  });

  const selectedRx = filteredPrescriptions[selectedIndex] || rawList[0] || null;

  // Resolve medicines array for the selected prescription
  const getMedicinesArray = (rx) => {
    if (!rx) return [];
    if (Array.isArray(rx.medicines) && rx.medicines.length > 0) return rx.medicines;
    if (Array.isArray(rx.medications) && rx.medications.length > 0) return rx.medications;
    if (Array.isArray(rx.items) && rx.items.length > 0) return rx.items;
    if (Array.isArray(rx.drugs) && rx.drugs.length > 0) return rx.drugs;

    // Direct medicine document check (MongoDB schema format)
    if (rx.medicineName || rx.name || rx.drug || rx.medicine) {
      return [rx];
    }
    return [];
  };

  const currentMedicines = getMedicinesArray(selectedRx);

  const rawDoc =
    selectedRx?.doctorName ||
    selectedRx?.prescribedBy ||
    selectedRx?.doctor ||
    "Dr. Charith Kalhara";
  const doctorName = String(rawDoc).startsWith("Dr.") ? rawDoc : `Dr. ${rawDoc}`;

  const hospitalName =
    selectedRx?.hospital ||
    selectedRx?.clinic ||
    "Smart Hospital";

  let dateStr = "2026-10-05";
  if (selectedRx?.date || selectedRx?.dateIssued || selectedRx?.createdAt) {
    const d = selectedRx.date || selectedRx.dateIssued || selectedRx.createdAt;
    dateStr = String(d).includes("T") ? new Date(d).toLocaleDateString() : d;
  }

  const diagnosis = selectedRx?.diagnosis || "General Consultation";
  const patientName = activeUser?.fullName || activeUser?.name || "Charith Kalhara";

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-slate-200 flex flex-col text-left">
        
        {/* Header */}
        <div className="bg-[#1E5FAD] text-white p-6 flex justify-between items-center rounded-t-3xl shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded-2xl text-2xl">
              <FaPills />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-wide">Prescriptions & Treatments</h3>
              <p className="text-xs text-blue-100 font-medium">Patient Prescription Records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-6 bg-slate-50/50">
          
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search Prescription"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full bg-white rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#1E5FAD] transition-colors"
            />
          </div>

          {selectedRx ? (
            <div className="space-y-6">
              
              {/* Prescription Metadata Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Prescription Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                  <div>
                    <span className="text-slate-400 font-medium">Doctor : </span>
                    <span className="text-slate-800 font-bold">{doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Hospital : </span>
                    <span className="text-slate-800 font-bold">{hospitalName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date : </span>
                    <span className="text-slate-800 font-mono font-bold">{dateStr}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Diagnosis : </span>
                    <span className="text-slate-800 font-bold">{diagnosis}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-medium">Patient : </span>
                    <span className="text-slate-800 font-bold">{patientName}</span>
                  </div>
                </div>
              </div>

              {/* Medicines Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Medicine</th>
                      <th className="p-4">Dosage</th>
                      <th className="p-4">Frequency</th>
                      <th className="p-4 pr-6">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentMedicines.length > 0 ? (
                      currentMedicines.map((m, idx) => {
                        const name = m.medicineName || m.name || m.drug || "Ibuprofen 400mg";
                        const dosage = m.dosage || m.dose || "1 Tablet Twice Daily (BID)";
                        const freq = m.frequency || m.instruction || "As Directed";
                        const duration = m.duration || "3 Days";

                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4 pl-6 font-bold text-slate-900">{name}</td>
                            <td className="p-4 text-slate-700">{dosage}</td>
                            <td className="p-4 text-slate-700">{freq}</td>
                            <td className="p-4 pr-6 text-emerald-600 font-semibold">{duration}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-slate-400 italic">
                          No medicines listed in this prescription.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Treatments & Instructions Banner */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl space-y-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Treatments & Instructions
                </h5>
                <p className="text-sm font-medium text-emerald-800">
                  {selectedRx.instructions ||
                    selectedRx.notes ||
                    "Take medicines strictly after meals with plenty of water. Complete full course as advised."}
                </p>
              </div>

              {/* Previous Prescriptions Selector */}
              {rawList.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Previous Prescriptions
                  </h5>
                  <div className="flex flex-col gap-2">
                    {rawList.map((item, idx) => {
                      const itemDate = item.date || item.dateIssued || "2026-10-05";
                      const isSelected = selectedIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                            isSelected
                              ? "border-[#1E5FAD] bg-blue-50/40 text-blue-900 font-bold"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span className="font-mono text-xs">{itemDate}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedIndex(idx)}
                            className="text-xs flex items-center gap-1.5 text-[#1E5FAD] hover:underline font-bold cursor-pointer"
                          >
                            <FaEye /> View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 italic font-medium">
              No prescriptions found matching your search.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}