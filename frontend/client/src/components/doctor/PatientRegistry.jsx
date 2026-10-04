import React, { useState } from "react";
import { 
  FaSearch, FaUserMd, FaHistory, FaFileMedical, 
  FaPhoneAlt, FaCalendarAlt, FaTint, FaChevronRight 
} from "react-icons/fa";

// Pulling initial state from parent mock context structure
const registryMockData = [
  {
    id: "P10024",
    name: "John Doe",
    age: "28",
    gender: "Male",
    bloodGroup: "O+",
    phone: "0771234567",
    lastVisit: "2026-05-10",
    condition: "Severe Viral Fever"
  },
  {
    id: "P10018",
    name: "Chanchala Madhushani",
    age: "31",
    gender: "Female",
    bloodGroup: "A+",
    phone: "0719876543",
    lastVisit: "2026-05-20",
    condition: "Allergic Bronchitis"
  }
];

export default function PatientRegistry() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter list by ID, Name, Phone Number, or Blood Group
  const filteredPatients = registryMockData.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.id.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchLower) ||
      patient.bloodGroup.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn w-full pt-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Patient Registry</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Browse, search, and manage master institutional record files.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 font-mono text-xs font-bold px-3 py-1.5 rounded-lg text-slate-500">
          Total Records: {registryMockData.length}
        </div>
      </div>

      {/* FILTER SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-w-2xl">
        <div className="flex bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden items-center px-4 focus-within:border-[#078a72] transition-all">
          <FaSearch className="text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search by ID, Name, Phone, or Blood Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent px-4 py-3.5 text-base font-bold outline-none placeholder-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* REGISTRY LIST GRID */}
      {filteredPatients.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-base text-slate-400 font-bold">
          No medical record cards match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id} 
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 group-hover:bg-[#078a72] transition-colors" />

              {/* Main Meta Information */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 font-black text-xl text-[#078a72] flex items-center justify-center uppercase shadow-inner">
                  {patient.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{patient.name}</h4>
                    <span className="font-mono text-xs font-bold text-[#078a72] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                      {patient.id}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-400">
                    {patient.age} Yrs old • {patient.gender}
                  </p>
                </div>
              </div>

              {/* Patient Quick Vitals Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <FaTint className="text-red-500 text-sm" />
                  <span>Blood Group: <span className="text-slate-900 font-black">{patient.bloodGroup}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhoneAlt className="text-slate-400 text-sm" />
                  <span className="font-mono">{patient.phone}</span>
                </div>
              </div>

              {/* Last Consultation History Snapshot */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs font-bold">
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Last Admitted Condition</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <FaFileMedical className="text-[#078a72]" />
                    <span>{patient.condition}</span>
                  </div>
                </div>
                <div className="text-right text-slate-400 font-mono text-[11px]">
                  <div className="flex items-center gap-1 justify-end">
                    <FaCalendarAlt />
                    <span>{patient.lastVisit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}