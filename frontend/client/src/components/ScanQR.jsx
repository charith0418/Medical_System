import React, { useState } from 'react';
import { FaQrcode, FaCamera, FaUpload, FaUserCheck } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ScanQR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleStartScan = () => {
    setIsScanning(true);
    // Mocking an automated successful scan response after 2 seconds
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({ id: "P10024", name: "John Doe", blood: "O+", status: "Verified Profile Active" });
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-[#1e293b]">
      {/* Interactive Scan Workspace */}
      <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-xs border border-gray-100 flex flex-col items-center justify-center min-h-[350px]">
        <div className={`w-44 h-44 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center bg-gray-50 transition-all mb-6 ${isScanning ? 'border-[#078a72] animate-pulse bg-emerald-50/30' : 'border-gray-200'}`}>
          <div className={`text-4xl ${isScanning ? 'text-[#078a72]' : 'text-gray-300'}`}><FaQrcode /></div>
          <span className="text-[11px] font-bold mt-2 text-gray-400 uppercase tracking-wider">
            {isScanning ? "Camera Live..." : "Scanner Standby"}
          </span>
        </div>
        
        <div className="flex gap-3 w-full max-w-xs">
          <button 
            onClick={handleStartScan}
            disabled={isScanning}
            className="flex-1 py-2.5 bg-[#078a72] text-white text-xs font-bold rounded-xl hover:bg-[#06735f] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
          >
            <FaCamera /> <span>{isScanning ? "Scanning..." : "Start Scanner"}</span>
          </button>
          <button className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 cursor-pointer">
            <FaUpload /> <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Results Card Window */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
        <div>
          <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span className="text-[#078a72]"><FaUserCheck /></span> <span>Identity Data Match</span>
          </h3>
          {scanResult ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3 text-xs font-semibold text-gray-700 animate-in fade-in duration-200">
              <p className="flex justify-between border-b border-emerald-100/50 pb-1"><span>👤 Name:</span> <span className="text-gray-900 font-bold">{scanResult.name}</span></p>
              <p className="flex justify-between border-b border-emerald-100/50 pb-1"><span>🆔 System Key:</span> <span className="text-[#078a72] font-mono">{scanResult.id}</span></p>
              <p className="flex justify-between border-b border-emerald-100/50 pb-1"><span>🩸 Blood Group:</span> <span className="font-mono text-red-600 font-black">{scanResult.blood}</span></p>
              <p className="flex justify-between pt-1"><span>🛡️ Guard Status:</span> <span className="text-emerald-600 font-bold">{scanResult.status}</span></p>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-xl bg-gray-50/50 text-xs font-medium text-gray-400">
              No live scanned session signature loaded yet.
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 font-medium text-center mt-4">Medicare card scanning verification engine v1.0</p>
      </div>
    </div>
  );
};

export default ScanQR;