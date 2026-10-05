import React from "react";
import { FaNotesMedical } from "react-icons/fa";

export default function MedicalHistory({ medicalHistory = [], history = [], onViewAll }) {
  // Support both medicalHistory and history prop names
  const rawList = Array.isArray(medicalHistory) && medicalHistory.length > 0 
    ? medicalHistory 
    : Array.isArray(history) 
    ? history 
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col justify-between">
      <div>
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

          <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#1E5FAD] flex items-center justify-center shrink-0">
            <FaNotesMedical className="text-xl" />
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {rawList.length > 0 ? (
            rawList.map((item, index) => {
              // Extract doctor name from doctorName, doctor, or nested object
              const rawDoc =
                item.doctorName ||
                item.doctor ||
                item.physician ||
                (typeof item.doctor === "object" ? item.doctor.name || item.doctor.fullName : null) ||
                "Dr. Medical Officer";

              const docName = String(rawDoc).trim().startsWith("Dr.") 
                ? String(rawDoc).trim() 
                : `Dr. ${String(rawDoc).trim()}`;

              const diagnosisName =
                item.diagnosis ||
                item.illness ||
                item.condition ||
                item.notes ||
                "General Visit";

              // Format date cleanly
              let formattedDate = "Recent";
              if (item.date) {
                formattedDate = item.date.includes("T") 
                  ? new Date(item.date).toLocaleDateString() 
                  : item.date;
              } else if (item.createdAt) {
                formattedDate = new Date(item.createdAt).toLocaleDateString();
              }

              return (
                <div
                  key={item._id || index}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition bg-slate-50/40 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {diagnosisName}
                      </h4>

                      <p className="text-sm text-gray-500 mt-1">
                        {docName}
                        {item.department ? ` • ${item.department}` : ""}
                      </p>
                    </div>

                    <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium shrink-0 ml-2">
                      {formattedDate}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">
                No medical history available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 text-right pt-2">
        <button
          onClick={onViewAll}
          className="text-[#1E5FAD] font-semibold text-sm hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>
    </div>
  );
}