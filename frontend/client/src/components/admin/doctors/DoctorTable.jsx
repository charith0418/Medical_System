import React, { useState } from "react";

export default function DoctorTable({
  doctors = [],
  totalDoctors = 0,
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  const [deleteDoctor, setDeleteDoctor] = useState(null);

  const safeDoctorsList = Array.isArray(doctors) ? doctors : [];
  const displayTotal = totalDoctors || safeDoctorsList.length;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
      {/* Table Header Strip */}
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Doctor List</h2>
          <p className="text-gray-500 text-sm">Manage registered doctors</p>
        </div>

        <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-6 py-3">
          <h2 className="text-lg font-semibold text-blue-700">
            Total Doctors: {displayTotal}
          </h2>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Doctor ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Specialization
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {safeDoctorsList.length > 0 ? (
              safeDoctorsList.map((doctor, idx) => (
                <tr
                  key={doctor._id || doctor.id || idx}
                  className="hover:bg-slate-50/80 transition"
                >
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-blue-600">
                    {doctor.doctorId || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {doctor.name || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {doctor.specialization || doctor.specialty || "General"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {doctor.phone || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-center text-sm">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onView(doctor)}
                        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() => onEdit(doctor)}
                        className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium text-xs transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteDoctor(doctor)}
                        className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-400 text-sm">
                  No doctors found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDoctor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-rose-600">Delete Doctor</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900">{deleteDoctor.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteDoctor(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onDelete(deleteDoctor._id || deleteDoctor.id);
                  setDeleteDoctor(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}