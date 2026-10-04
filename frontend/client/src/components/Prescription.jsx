import React from 'react';
import { FaFilePrescription, FaPrint } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Prescriptions = () => {
  return (
    <div className="max-w-2xl bg-white p-6 rounded-2xl shadow-xs border border-gray-100 mx-auto text-[#1e293b]">
      <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center space-x-2">
        <span className="text-[#078a72]"><FaFilePrescription /></span> <span>Generate Medical Script Tuple</span>
      </h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Target Recipient Patient ID</label>
          <input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden" placeholder="Enter target patient key..." required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Medicine Nomenclature</label>
            <input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden" placeholder="Amoxicillin 500mg" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Dosage Schedule Routine</label>
            <input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden" placeholder="1 Capsule - 3x Daily" required />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Cycle Duration Parameter</label>
            <input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden" placeholder="7 Days / Continuous" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Advisory Warning Meta Flag</label>
            <input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden" placeholder="Take post-meals only" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button type="submit" className="py-2.5 bg-[#078a72] text-white font-bold text-sm rounded-xl hover:bg-[#06735f] transition-all shadow-xs cursor-pointer">
            Save Script
          </button>
          <button type="button" className="py-2.5 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 cursor-pointer">
            <FaPrint /> <span>Print Script</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Prescriptions;