import React from "react";
// CHANGED PLACE: Replaced FaFolderMedical with FaNotesMedical
import { FaUserPlus, FaFilePrescription, FaNotesMedical, FaChartPie } from "react-icons/fa";

export default function DoctorActionButtons() {
  const actions = [
    { label: "Add Treatment", sub: "Add new treatment", icon: <FaUserPlus />, style: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100/70" },
    { label: "Create Prescription", sub: "Generate prescription", icon: <FaFilePrescription />, style: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100/70" },
    // CHANGED PLACE: Using FaNotesMedical here instead
    { label: "Patient Records", sub: "View full history", icon: <FaNotesMedical />, style: "text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100/70" },
    { label: "Reports", sub: "Generate reports", icon: <FaChartPie />, style: "text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100/70" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-2">
      {actions.map((act, index) => (
        <button
          key={index}
          type="button"
          className={`flex flex-col items-center justify-center text-center p-4 rounded-2xl border transition-all duration-300 group shadow-2xs ${act.style}`}
        >
          <div className="text-2xl mb-2 bg-white p-3 rounded-xl shadow-xs group-hover:scale-105 transition-transform duration-200">
            {act.icon}
          </div>
          <span className="font-bold text-sm block tracking-wide">{act.label}</span>
          <span className="text-[10px] opacity-70 mt-0.5 hidden sm:block">{act.sub}</span>
        </button>
      ))}
    </div>
  );
}