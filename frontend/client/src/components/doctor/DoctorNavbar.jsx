import React from "react";
import { FaUserMd } from "react-icons/fa";

export default function DoctorNavbar() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs w-full">
      <h1 className="text-xl font-bold tracking-wide text-slate-800 uppercase">
        Patient Care Dashboard
      </h1>
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
        <div className="text-right">
          <div className="text-sm font-bold text-slate-900 tracking-tight">Dr. Asela Perera</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mt-0.5">
            Senior Registrar • Emergency Department
          </div>
        </div>
        <div className="w-9 h-9 bg-slate-800 text-white rounded-lg flex items-center justify-center text-base font-bold shadow-xs">
          <FaUserMd />
        </div>
      </div>
    </header>
  );
}