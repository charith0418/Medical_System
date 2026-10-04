import React from 'react';
import { FaChartBar, FaUserFriends, FaClipboardCheck } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Reports = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#1e293b]">
      {/* Top Aggregations Data Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl"><FaChartBar /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Treatments This Week</p>
            <p className="text-2xl font-black text-gray-800 mt-0.5">42</p>
          </div>
        </div>
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl"><FaUserFriends /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patients This Month</p>
            <p className="text-2xl font-black text-gray-800 mt-0.5">189</p>
          </div>
        </div>
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-xl"><FaClipboardCheck /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scripts Dispatched</p>
            <p className="text-2xl font-black text-gray-800 mt-0.5">96</p>
          </div>
        </div>
      </div>

      {/* Chart Placement Block Area Frame */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <h3 className="text-md font-bold text-gray-800 mb-3">Historical Diagnostics Log</h3>
        <div className="text-xs font-semibold text-gray-400 py-12 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
          📈 Data visualizations, line tracking graphs, and historic CSV download arrays will connect here when backend database aggregation goes live.
        </div>
      </div>
    </div>
  );
};

export default Reports;