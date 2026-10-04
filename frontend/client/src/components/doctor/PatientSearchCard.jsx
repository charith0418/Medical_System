import React from "react";
import { FaSearch } from "react-icons/fa";

export default function PatientSearchCard() {
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-gray-800 font-bold text-lg mb-1">Search Patient</h3>
        <p className="text-slate-400 text-xs mb-4">Search by name or unique Patient ID...</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
          <input type="text" placeholder="Search by name or Patient ID..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl text-sm font-medium transition">Search</button>
      </div>
    </div>
  );
}