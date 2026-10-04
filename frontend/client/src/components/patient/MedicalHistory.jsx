import React from "react";
import { FaNotesMedical } from "react-icons/fa";

export default function MedicalHistory({ medicalHistory = [], onViewAll }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Medical History
          </h3>
          <p className="text-sm text-gray-500">
            Patient past medical records
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#1E5FAD] flex items-center justify-center">
          <FaNotesMedical className="text-xl" />
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">

        {medicalHistory.length > 0 ? (
          medicalHistory.map((item, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {item.diagnosis || "diagnosis Name"}
                  </h4>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.doctor || "doctor Name"}
                  </p>
                </div>

                <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  {item.date || "----"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">
              No medical history available
            </p>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="mt-5 text-right">
        <button
            onClick={onViewAll}
            className="text-[#1E5FAD] font-semibold text-sm hover:underline"
        >
            View All
        </button>
      </div>

    </div>
  );
}