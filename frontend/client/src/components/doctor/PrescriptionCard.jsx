import React from "react";

export default function PrescriptionCard({ rx }) {
  if (!rx) return null;

  const medicines = Array.isArray(rx.medicines) ? rx.medicines : [];

  return (
    <div className="space-y-6 w-full">
      {/* Overview Info */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs text-base font-medium text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Prescription {rx.id || rx._id || "N/A"}
          </h4>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-xs block mb-0.5">Ordered By</span>
            <span className="text-slate-900 font-medium">{rx.doctor || "N/A"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-xs block mb-0.5">Hospital / Clinic</span>
            <span className="text-slate-900 font-medium">{rx.hospital || "N/A"}</span>
          </div>
        </div>

        <div className="space-y-2 md:text-right md:flex md:flex-col md:justify-between md:items-end">
          <div className="bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-xl text-sm font-medium text-slate-500 w-fit">
            {rx.date || "N/A"}
          </div>
          <div className="mt-2 md:mt-0">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-xs block mb-0.5">Prescribed For</span>
            <span className="text-slate-900 font-bold tracking-tight text-lg">{rx.diagnosis || "General Consultation"}</span>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest">
              <th className="p-4 pl-6">Medicine Name</th>
              <th className="p-4">Dose / Amount</th>
              <th className="p-4">How Often (Frequency)</th>
              <th className="p-4 pr-6 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-base font-medium text-slate-700">
            {medicines.length > 0 ? (
              medicines.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 text-slate-900 font-bold tracking-tight">{m.name || "N/A"}</td>
                  <td className="p-4 text-slate-600 text-sm">{m.dosage || "N/A"}</td>
                  <td className="p-4 text-slate-600">{m.frequency || "As directed"}</td>
                  <td className="p-4 pr-6 text-right text-emerald-700 font-bold text-sm uppercase tracking-wider">{m.duration || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-400 italic">No medicines listed in this prescription.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Special Instructions */}
      {rx.instructions && (
        <div className="bg-slate-800 text-white p-6 rounded-2xl space-y-2.5 border border-slate-700 shadow-sm w-full">
          <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Special Instructions for Patient</h5>
          <p className="text-base font-medium text-slate-300 leading-relaxed">{rx.instructions}</p>
        </div>
      )}
    </div>
  );
}