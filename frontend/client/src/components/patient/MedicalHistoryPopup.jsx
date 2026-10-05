import React, { useState } from "react";
import { FaHeartbeat, FaTimes, FaSearch, FaSyringe, FaShieldAlt, FaStethoscope } from "react-icons/fa";

export default function MedicalHistoryPopup({
  patient = {},
  user = {},
  medicalHistory = [],
  history = [],
  surgeries = [],
  allergies = [],
  vaccinations = [],
  onClose,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const activeUser = Object.keys(patient).length > 0 ? patient : user;

  // Resolve history array
  const rawHistory =
    (Array.isArray(medicalHistory) && medicalHistory.length > 0 ? medicalHistory : null) ||
    (Array.isArray(history) && history.length > 0 ? history : null) ||
    (Array.isArray(activeUser?.history) && activeUser.history.length > 0 ? activeUser.history : null) ||
    (Array.isArray(activeUser?.medicalHistory) ? activeUser.medicalHistory : []);

  // Resolve allergies array
  const rawAllergies =
    (Array.isArray(allergies) && allergies.length > 0 ? allergies : null) ||
    (Array.isArray(activeUser?.allergies) ? activeUser.allergies : []);

  // Resolve surgeries array
  const rawSurgeries =
    (Array.isArray(surgeries) && surgeries.length > 0 ? surgeries : null) ||
    (Array.isArray(activeUser?.surgeries) ? activeUser.surgeries : []);

  // Resolve vaccinations array
  const rawVaccinations =
    (Array.isArray(vaccinations) && vaccinations.length > 0 ? vaccinations : null) ||
    (Array.isArray(activeUser?.vaccinations) ? activeUser.vaccinations : []);

  // Calculate age from Date of Birth
  const calculateAge = (dobString) => {
    if (!dobString || dobString === "N/A") return "N/A";
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return "N/A";
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970) + " Yrs";
  };

  const filteredHistory = rawHistory.filter((item) => {
    const diag = (item.diagnosis || item.illness || item.notes || "").toLowerCase();
    const doc = (item.doctorName || item.doctor || "").toLowerCase();
    return diag.includes(searchTerm.toLowerCase()) || doc.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-slate-200 flex flex-col text-left">
        
        {/* Header */}
        <div className="bg-[#1E5FAD] text-white p-6 flex justify-between items-center rounded-t-3xl shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/10 rounded-2xl text-2xl text-white">
              <FaHeartbeat />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-wide">Medical History</h3>
              <p className="text-xs text-blue-100 font-medium">Complete Patient Medical Records</p>
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
          
          {/* Patient Overview Details */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-xs">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-slate-400 block uppercase mb-1">
                Patient Name
              </span>
              <span className="text-base text-slate-900 font-bold">
                {activeUser?.fullName || activeUser?.name || "Charith Kalhara"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-slate-400 block uppercase mb-1">
                Age
              </span>
              <span className="text-base text-slate-900 font-bold">
                {calculateAge(activeUser?.dob)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-slate-400 block uppercase mb-1">
                Blood Group
              </span>
              <span className="text-base text-rose-600 font-black">
                {activeUser?.bloodGroup || "O+"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-slate-400 block uppercase mb-1">
                Date of Birth
              </span>
              <span className="text-base text-slate-900 font-semibold">
                {activeUser?.dob || "4/18/2003"}
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#1E5FAD] transition-colors"
            />
          </div>

          {/* Medical History Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Diagnosis</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4 pr-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-400 italic font-medium">
                      No matching medical records found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((h, i) => {
                    const rawDoc =
                      h.doctorName ||
                      h.doctor ||
                      h.prescribedBy ||
                      (typeof h.doctor === "object" ? h.doctor.name || h.doctor.fullName : null) ||
                      "Dr. Charith Kalhara";

                    const doc = String(rawDoc).startsWith("Dr.") ? rawDoc : `Dr. ${rawDoc}`;

                    let dateStr = "2026-10-05";
                    if (h.date) {
                      dateStr = h.date.includes("T") ? new Date(h.date).toLocaleDateString() : h.date;
                    }

                    return (
                      <tr key={h._id || i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 pl-6 text-slate-900 font-bold">
                          {h.diagnosis || h.illness || "General Visit"}
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {doc}
                        </td>
                        <td className="p-4 pr-6 text-right font-mono text-xs text-slate-500">
                          {dateStr}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Surgeries & Allergies Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Surgeries */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <FaStethoscope className="text-blue-600" /> Previous Surgeries
              </h4>
              {rawSurgeries.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No past surgeries reported.</p>
              ) : (
                <div className="space-y-2">
                  {rawSurgeries.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{s.name || s.procedure}</span>
                      <span className="text-slate-400 font-mono">{s.date || "N/A"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Allergies */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
              <h4 className="font-bold text-rose-600 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <FaShieldAlt /> Allergies
              </h4>
              {rawAllergies.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No allergies recorded.</p>
              ) : (
                <ul className="space-y-1.5">
                  {rawAllergies.map((allergy, idx) => {
                    const allergyName = typeof allergy === "string" ? allergy : allergy.name || allergy.allergy || "Allergy";
                    return (
                      <li key={idx} className="flex items-center gap-2 text-xs font-bold text-rose-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>{allergyName}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Vaccination Records */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
            <h4 className="font-bold text-emerald-700 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FaSyringe /> Vaccination Records
            </h4>
            {rawVaccinations.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No vaccination records reported.</p>
            ) : (
              <div className="space-y-2">
                {rawVaccinations.map((v, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{v.name || v.vaccine}</span>
                    <span className="text-slate-400 font-mono">{v.date || "Completed"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}