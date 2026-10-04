import React, { useMemo, useState } from "react";
import {
  X,
  Search,
  FileDown,
  HeartPulse,
  Stethoscope,
  ShieldAlert,
  Syringe,
} from "lucide-react";

export default function MedicalHistoryPopup({ open, onClose, user, medicalHistory, surgeries, allergies, vaccinations, }) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
  return medicalHistory.filter((item) =>
    item.diagnosis.toLowerCase().includes(search.toLowerCase())
  );
}, [medicalHistory, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-8 py-5 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <HeartPulse size={34} />
            <div>
              <h1 className="text-2xl font-bold">Medical History</h1>
              <p className="text-blue-100 text-sm">
                Complete Patient Medical Records
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

        {/* Body */}
        <div className="p-8 max-h-[80vh] overflow-y-auto">

          {/* Patient Info */}
          <div className="bg-blue-50 rounded-2xl p-6 grid md:grid-cols-4 gap-5 mb-8">

            <div>
              <p className="text-gray-500 text-sm">Patient Name</p>
              <h2 className="font-bold text-lg">{user.name}</h2>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Age</p>
              <h2 className="font-bold text-lg">{user.age}</h2>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Blood Group</p>
              <h2 className="font-bold text-lg text-red-500">{user.bloodGroup}</h2>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Date of Birth</p>
              <h2 className="font-bold text-lg">{user.dob}</h2>
            </div>

          </div>

          {/* Search */}
          <div className="flex justify-between items-center mb-6">

            <div className="relative w-80">

              <Search
                className="absolute left-4 top-3 text-gray-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Search diagnosis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-xl w-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>
                  <th className="text-left p-4">Diagnosis</th>
                  <th className="text-left p-4">Doctor</th>
                  <th className="text-left p-4">Date</th>
                </tr>

              </thead>

              <tbody>

                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-blue-50"
                  >
                    <td className="p-4">{item.diagnosis}</td>
                    <td className="p-4">{item.doctor}</td>
                    <td className="p-4">{item.date}</td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* Bottom */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <div className="border rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-4">
                <Stethoscope className="text-blue-600" />
                <h2 className="font-bold text-xl">Previous Surgeries</h2>
              </div>

              <ul className="space-y-4">
                {surgeries.map((item) => (
                    <li key={item.id} className="flex justify-between items-start border-b pb-3">
                    
                    <div>
                    <p className="font-semibold">{item.surgery}</p>
                    <p className="text-sm text-gray-500">{item.doctor}</p>
                    </div>

                    <p className="text-xs text-gray-400">{item.date}</p>
                    </li>
                ))}
                </ul>

            </div>

            <div className="border rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-4 ">

                    <ShieldAlert className="text-red-500" />
                    <h2 className="font-bold text-xl">Allergies</h2>

                </div>

                <ul className=" list-disc list-inside space-y-5 ">

                    {allergies.map((item) => (
                        <li key={item.id} className="text-gray-700 border-b">
                            {item.allergy}
                        </li>
                    ))}
                </ul>
            </div>

          </div>

          {/* Vaccinations */}
          <div className="mt-8 border rounded-2xl p-6">

            <div className="flex items-center gap-3 mb-4">
              <Syringe className="text-green-600" />
              <h2 className="font-bold text-xl">Vaccination Records</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
  {vaccinations.map((item) => (
    <div
      key={item.id}
      className="bg-green-50 rounded-xl p-4"
    >
      <h3 className="font-semibold">
        {item.vaccine}
      </h3>

      <p className="text-sm text-gray-500">
        {item.date}
      </p>
    </div>
  ))}
</div>

          </div>

        </div>

      </div>
    </div>
  );
}