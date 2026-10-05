import React from "react";
import { X, User, Mail, Phone, ShieldCheck, Stethoscope, Award } from "lucide-react";

export default function ViewDoctorModal({ open, onClose, doctor }) {
  if (!open || !doctor) return null;

  // Resolved values with fallbacks to match backend database schema
  const doctorId = doctor.doctorId || doctor.id || "N/A";
  const name =
    doctor.name ||
    `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
    doctor.email ||
    "Doctor";
  const email = doctor.email || "Not Provided";
  const phone = doctor.phone || "Not Provided";
  const nic = doctor.nic || doctor.nicNumber || "Not Provided";
  const specialization =
    doctor.specialization || doctor.specialty || "General";
  const license =
    doctor.license || doctor.medicalLicenseNo || doctor.licenseNo || "Verified";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Stethoscope className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">Doctor Details</h2>
              <p className="text-xs text-cyan-100 mt-0.5">
                Official hospital credentials & verified profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cyan-100 hover:text-white hover:bg-white/10 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Doctor Summary Strip */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800">{name}</h3>
            <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {specialization}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-gray-400 block uppercase">
              Doctor ID
            </span>
            <span className="font-mono text-sm font-bold text-gray-700">
              {doctorId}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Email */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-medium text-gray-800 truncate mt-0.5">
                {email}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Phone Number
              </p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {phone}
              </p>
            </div>
          </div>

          {/* NIC */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                NIC / National ID
              </p>
              <p className="text-sm font-mono font-medium text-gray-800 mt-0.5">
                {nic}
              </p>
            </div>
          </div>

          {/* Medical License */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3">
            <Award className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Medical License
              </p>
              <p className="text-sm font-mono font-medium text-gray-800 mt-0.5">
                {license}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}