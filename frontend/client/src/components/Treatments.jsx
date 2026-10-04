import React, { useState } from 'react';
import { FaNotesMedical, FaClock } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Treatments = () => {
  const [patient, setPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-[#1e293b]">
      {/* Data Intake Entry Form Panel */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center space-x-2">
          <span className="text-[#078a72]"><FaNotesMedical /></span> <span>Record Consultation Session</span>
        </h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Patient Identity lookup</label>
            <input type="text" placeholder="Search or select active profile..." value={patient} onChange={(e)=>setPatient(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#078a72]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Diagnosis Primary Title Summary</label>
            <input type="text" placeholder="e.g., Acute Migraine / Hypertension" value={diagnosis} onChange={(e)=>setDiagnosis(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#078a72]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Clinical Treatment Log Notes</label>
            <textarea rows="4" placeholder="Enter patient session advice parameters, physiological metrics observed, etc..." value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#078a72]" required></textarea>
          </div>
          <button type="submit" className="w-full py-2.5 bg-[#078a72] text-white font-bold text-sm rounded-xl hover:bg-[#06735f] transition-all shadow-xs cursor-pointer">
            Save Consultation Data
          </button>
        </form>
      </div>

      {/* Right Box: Audit History Context Timeline */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span className="text-gray-400"><FaClock /></span> <span>Recent Entries This Shift</span>
          </h3>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-blue-500 bg-gray-50 rounded-r-xl text-xs font-semibold">
              <p className="text-gray-900 font-bold">John Doe</p>
              <p className="text-gray-500 font-medium mt-0.5">Diagnosis: Seasonal Allergy Symptoms</p>
              <p className="text-gray-400 text-[10px] mt-1 font-medium">20 June 2026 • 04:15 PM</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-center text-gray-400 font-medium mt-4">Encrypted medical records entry node pipeline</p>
      </div>
    </div>
  );
};

export default Treatments;