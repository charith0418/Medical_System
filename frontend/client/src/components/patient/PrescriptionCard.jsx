import React from "react";
import { FaPills } from "react-icons/fa";

export default function PrescriptionCard({ prescriptions = [], medications = [], onViewAll }) {
  const safePrescriptions = Array.isArray(prescriptions) && prescriptions.length > 0
    ? prescriptions
    : Array.isArray(medications)
    ? medications
    : [];

  const latestPrescription = safePrescriptions.length > 0 ? safePrescriptions[0] : null;

  // Extract medicine items whether prescriptions is a flat list of drugs or holds nested medicines
  const resolveMedicinesList = () => {
    if (!safePrescriptions.length) return [];

    // 1. If latest prescription has a nested medicines or items array
    if (Array.isArray(latestPrescription?.medicines) && latestPrescription.medicines.length > 0) {
      return latestPrescription.medicines;
    }
    if (Array.isArray(latestPrescription?.medications) && latestPrescription.medications.length > 0) {
      return latestPrescription.medications;
    }
    if (Array.isArray(latestPrescription?.items) && latestPrescription.items.length > 0) {
      return latestPrescription.items;
    }

    // 2. If the prescriptions array contains the medicine records directly (MongoDB schema)
    const flatMeds = safePrescriptions.filter(
      (rx) => rx && (rx.medicineName || rx.name || rx.drug || rx.medicine)
    );
    if (flatMeds.length > 0) {
      return flatMeds;
    }

    return [];
  };

  const medicinesList = resolveMedicinesList();

  const rxTitle =
    latestPrescription?.diagnosis ||
    latestPrescription?.title ||
    latestPrescription?.prescribedFor ||
    "Current Prescribed Medicines";

  let formattedDate = "Recent";
  const rawDate =
    latestPrescription?.dateIssued ||
    latestPrescription?.date ||
    latestPrescription?.createdAt;

  if (rawDate) {
    formattedDate = String(rawDate).includes("T")
      ? new Date(rawDate).toLocaleDateString()
      : rawDate;
  }

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

        {safePrescriptions.length > 0 ? (
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
            {medicinesList.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {medicinesList.map((medicine, index) => {
                  if (!medicine) return null;

                  const drugName =
                    typeof medicine === "string"
                      ? medicine
                      : medicine.medicineName ||
                        medicine.name ||
                        medicine.medicine ||
                        medicine.drug ||
                        (medicine.medicineMasterId && typeof medicine.medicineMasterId === "object"
                          ? medicine.medicineMasterId.medicineName || medicine.medicineMasterId.name
                          : null) ||
                        "Prescribed Medication";

                  const dosage =
                    medicine.dosage || medicine.dose || medicine.amount || "As directed";
                  const frequency =
                    medicine.frequency || medicine.instruction || "As directed";
                  const duration = medicine.duration || "N/A";
                  const doctor = medicine.prescribedBy || medicine.doctorName || medicine.doctor || "";

                  return (
                    <div
                      key={medicine._id || medicine.id || index}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition bg-slate-50/40 text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-800">
                            {drugName}
                          </h5>

                          {typeof medicine === "object" && (
                            <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                              <p>
                                <span className="font-medium text-gray-500">Dosage:</span>{" "}
                                {dosage}
                              </p>
                              {frequency !== "As directed" && (
                                <p>
                                  <span className="font-medium text-gray-500">Frequency:</span>{" "}
                                  {frequency}
                                </p>
                              )}
                              <p>
                                <span className="font-medium text-gray-500">Duration:</span>{" "}
                                <span className="text-emerald-600 font-semibold">{duration}</span>
                              </p>
                              {doctor && (
                                <p className="text-slate-400 mt-1">
                                  Prescribed by: {doctor.startsWith("Dr.") ? doctor : `Dr. ${doctor}`}
                                </p>
                              )}
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