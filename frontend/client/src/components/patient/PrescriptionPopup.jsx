import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Search,
  ChevronDown,
  Eye,
  Download,
  Printer,
} from "lucide-react";

export default function PrescriptionPopup({
  open,
  onClose,
  user,
  prescriptions,
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (open && prescriptions?.length) {
      setSelectedId((prev) =>
        prev && prescriptions.some((p) => p.id === prev)
          ? prev
          : prescriptions[0].id
      );
    }
  }, [open, prescriptions]);

  const filteredPrescriptions = useMemo(() => {
    if (!Array.isArray(prescriptions)) return [];

    const keyword = search.trim().toLowerCase();

    if (!keyword) return prescriptions;

    return prescriptions.filter((item) => {
      return (
        item.prescriptionNo?.toLowerCase().includes(keyword) ||
        item.doctor?.toLowerCase().includes(keyword) ||
        item.diagnosis?.toLowerCase().includes(keyword)
      );
    });
  }, [prescriptions, search]);

  const selectedPrescription =
    filteredPrescriptions.find((p) => p.id === selectedId) ||
    filteredPrescriptions[0] ||
    null;

  useEffect(() => {
    if (
      filteredPrescriptions.length &&
      !filteredPrescriptions.some((p) => p.id === selectedId)
    ) {
      setSelectedId(filteredPrescriptions[0].id);
    }
  }, [filteredPrescriptions, selectedId]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5">
        <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div>
                      <h1 className="text-2xl font-bold">
                        💊 Prescriptions & Treatments
                      </h1>

                      <p className="text-blue-100 text-sm">
                       Patient Prescription Records
                      </p>
                    </div>
              </div>
              <button
                          onClick={onClose}
                          className="hover:bg-white/20 p-2 rounded-full"
                        >
                          <X size={28} />
                        </button>
          </div>

        {/* Search */}
        <div className="flex justify-between items-center px-6 py-5">
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Prescription"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-xl w-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 "
            />
          </div>

        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!selectedPrescription ? (
            <div className="p-10 text-center text-gray-500">
              No prescriptions found.
            </div>
          ) : (
            <>
              {/* Prescription Header */}
             <div className="bg-blue-50 rounded-2xl p-6 grid md:grid-cols-2 gap-5 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Prescription {selectedPrescription.prescriptionNo}
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Doctor</span> :{" "}
                      {selectedPrescription.doctor}
                    </div>

                    <div>
                      <span className="font-medium">Hospital</span> :{" "}
                      {selectedPrescription.hospital}
                    </div>

                    <div>
                      <span className="font-medium">Date</span> :{" "}
                      {selectedPrescription.date}
                    </div>

                    <div>
                      <span className="font-medium">Diagnosis</span> :{" "}
                      {selectedPrescription.diagnosis}
                    </div>

                    {user?.name && (
                      <div>
                        <span className="font-medium">Patient</span> :{" "}
                        {user.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

    
              {/* Medicines Table */}
                <div className="overflow-hidden rounded-2xl border">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-4">Medicine</th>
                        <th className="text-left p-4">Dosage</th>
                        <th className="text-left p-4">Frequency</th>
                        <th className="text-left p-4">Duration</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedPrescription.medicines?.map((medicine) => (
                        <tr
                          key={medicine.id}
                          className="border-t hover:bg-blue-50"
                        >
                          <td className="p-4">{medicine.medicine}</td>
                          <td className="p-4">{medicine.dosage}</td>
                          <td className="p-4">{medicine.frequency}</td>
                          <td className="p-4">{medicine.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              {/* Instructions */}
              <div className=" rounded-2xl p-6 mt-5 bg-green-100">
                <h4 className="mb-4 font-semibold text-black-800">
                  Treatments & Instructions
                </h4>

                {selectedPrescription.instructions ? (
                  Array.isArray(selectedPrescription.instructions) ? (
                    <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                      {selectedPrescription.instructions.map(
                        (instruction, index) => (
                          <li key={index}>{instruction}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div className="whitespace-pre-line text-sm text-gray-700">
                      {selectedPrescription.instructions}
                    </div>
                  )
                ) : (
                  <p className="text-sm text-gray-500">
                    No instructions available.
                  </p>
                )}
              </div>

              {/* Previous Prescriptions */}
              <div className="border-b p-6">
                <h4 className="mb-4 font-semibold text-gray-800">
                  Previous Prescriptions
                </h4>

                <div className="space-y-2">
                  {filteredPrescriptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                        item.id === selectedPrescription.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-8">
                        <span className="font-medium">
                          {item.prescriptionNo}
                        </span>

                        <span className="text-sm text-gray-600">
                          {item.date}
                        </span>
                      </div>

                      <span className="flex items-center gap-2 text-blue-600">
                        <Eye size={16} />
                        View
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>


      </div>
    </div>
  );
}