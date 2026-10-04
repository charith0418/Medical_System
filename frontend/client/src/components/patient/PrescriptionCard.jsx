import React from "react";
import { FaPills } from "react-icons/fa";

export default function PrescriptionCard({ prescriptions = [], onViewAll }) {
  // Safe array fallback
  const safePrescriptions = Array.isArray(prescriptions) ? prescriptions : [];
  const latestPrescription = safePrescriptions.length > 0 ? safePrescriptions[0] : null;

  // Resolve medicines array safely (handles medicines, medications, or null/undefined)
  const getMedicinesArray = (prescription) => {
    if (!prescription) return [];
    if (Array.isArray(prescription.medicines)) return prescription.medicines;
    if (Array.isArray(prescription.medications)) return prescription.medications;
    return [];
  };

  const medicinesList = getMedicinesArray(latestPrescription);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Prescriptions & Treatments
            </h3>
            <p className="text-sm text-gray-500">
              Current prescribed medicines
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
            <FaPills className="text-xl" />
          </div>
        </div>

        {latestPrescription ? (
          <>
            {/* Prescription Details */}
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-gray-800">
                {latestPrescription.diagnosis || latestPrescription.title || "General Prescription"}
              </h4>
              <p className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
                {latestPrescription.date
                  ? new Date(latestPrescription.date).toLocaleDateString()
                  : "Recent"}
              </p>
            </div>

            {/* Medicines List with strict inline array validation */}
            {Array.isArray(medicinesList) && medicinesList.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {medicinesList.map((medicine, index) => {
                  if (!medicine) return null; // Safe check for null items in array

                  return (
                    <div
                      key={medicine.id || medicine._id || index}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-800">
                            {typeof medicine === "string"
                              ? medicine
                              : medicine.medicine ||
                                medicine.medicineName ||
                                medicine.name ||
                                "Medication"}
                          </h5>

                          {typeof medicine === "object" && (
                            <>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Dosage:</span>{" "}
                                {medicine.dosage || "As directed"}
                              </p>

                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Frequency:</span>{" "}
                                {medicine.frequency || "N/A"}
                              </p>

                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Duration:</span>{" "}
                                {medicine.duration || "N/A"}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="bg-red-100 p-2 rounded-full text-red-500 shrink-0">
                          <FaPills />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm italic">
                No specific medicines listed for this prescription.
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-400">
            No prescriptions available
          </div>
        )}
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