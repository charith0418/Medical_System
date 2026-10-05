import React from "react";
import { FaUserMd } from "react-icons/fa";

export default function DoctorNavbar({ doctor }) {
  // Read stored user from localStorage as fallback
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) storedUser = JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read user from localStorage", err);
  }

  // Determine dynamic doctor name
  const rawName =
    doctor?.name ||
    storedUser?.name ||
    (storedUser?.email ? storedUser.email.split("@")[0] : "Doctor");

  // Format with "Dr." prefix if not already added
  const displayName = rawName.toLowerCase().startsWith("dr.")
    ? rawName
    : `Dr. ${rawName}`;

  // Determine dynamic specialty
  const specialty =
    doctor?.specialty ||
    doctor?.specialization ||
    storedUser?.specialty ||
    storedUser?.specialization ||
    "General Physician • Outpatient Care";

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs w-full">
      <h1 className="text-xl font-bold tracking-wide text-slate-800 uppercase">
        Patient Care Dashboard
      </h1>

      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
        <div className="text-right">
          <div className="text-sm font-bold text-slate-900 tracking-tight">
            {displayName}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mt-0.5">
            {specialty}
          </div>
        </div>
        <div className="w-9 h-9 bg-slate-800 text-white rounded-lg flex items-center justify-center text-base font-bold shadow-xs">
          <FaUserMd />
        </div>
      </div>
    </header>
  );
}