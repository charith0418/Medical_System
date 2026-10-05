import React from "react";
import { FaPills } from "react-icons/fa";

export default function PrescriptionCard({ prescriptions = [], onViewAll }) {
  const safePrescriptions = Array.isArray(prescriptions) ? prescriptions : [];
  const latestPrescription = safePrescriptions.length > 0 ? safePrescriptions[0] : null;

  // Extract medicines from nested arrays or direct prescription objects
  const getMedicinesArray = (rx) => {
    if (!rx) return [];
    if (Array.isArray(rx.medicines) && rx.medicines.length > 0) return rx.medicines;
    if (Array.isArray(rx.medications) && rx.medications.length > 0) return rx.medications;
    if (Array.isArray(rx.items) && rx.items.length > 0) return rx.items;
    if (Array.isArray(rx.drugs) && rx.drugs.length > 0) return rx.drugs;
    if (Array.isArray(rx.prescriptions) && rx.prescriptions.length > 0) return rx.prescriptions;

    // Check if rx is itself a single prescribed medicine item
    if (
      rx.medicineName ||
      rx.medicine ||
      rx.name ||
      rx.drug ||
      (rx.medicineMasterId && typeof rx.medicineMasterId === "object")
    ) {
      return [rx];
    }

    return [];
  };

  // Extract from latest prescription, or flatten if prescriptions is a list of medicines
  let medicinesList = getMedicinesArray(latestPrescription);
  if (medicinesList.length === 0 && safePrescriptions.length > 0) {
    const flattened = safePrescriptions.flatMap((item) => getMedicinesArray(item));
    if (flattened.length > 0) {
      medicinesList = flattened;
    }
  }

  const getDrugName = (med) => {
    if (typeof med === "string") return med;
    if (!med) return "Medication";
    return (
      med.medicineName ||
      med.medicine ||
      med.name ||
      med.drug ||
      (med.medicineMasterId && typeof med.medicineMasterId === "object"
        ? med.medicineMasterId.medicineName || med.medicineMasterId.name
        : null) ||
      "Prescribed Medication"
    );
  };

  const rxTitle =
    latestPrescription?.diagnosis ||
    latestPrescription?.title ||
    latestPrescription?.prescribedFor ||
    "General Prescription";

  const rxDate =
    latestPrescription?.dateIssued ||
    latestPrescription?.date ||
    latestPrescription?.createdAt;

  const formattedDate = rxDate
    ? new Date(rxDate).toLocaleDateString()
    : "Recent";

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
                {rxTitle}
              </h4>
              <p className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
                {formattedDate}
              </p>
            </div>

            {/* Medicines List */}
            {Array.isArray(medicinesList) && medicinesList.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {medicinesList.map((medicine, index) => {
                  if (!medicine) return null;

                  const name = getDrugName(medicine);
                  const dosage =
                    medicine.dosage || medicine.dose || medicine.amount || "As directed";
                  const frequency =
                    medicine.frequency || medicine.instruction || "As directed";
                  const duration = medicine.duration || "N/A";

                  return (
                    <div
                      key={medicine.id || medicine._id || index}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition bg-slate-50/40"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-800">
                            {name}
                          </h5>

                          {typeof medicine === "object" && (
                            <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                              <p>
                                <span className="font-medium text-gray-500">Dosage:</span>{" "}
                                {dosage}
                              </p>
                              <p>
                                <span className="font-medium text-gray-500">Frequency:</span>{" "}
                                {frequency}
                              </p>
                              <p>
                                <span className="font-medium text-gray-500">Duration:</span>{" "}
                                <span className="text-emerald-600 font-semibold">{duration}</span>
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="bg-red-100 p-2 rounded-full text-red-500 shrink-0 ml-2">
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