import { useState } from "react";

export default function StaffTable({ staff, totalStaff, onView, onEdit, onDelete, }) {

    const [deleteStaff, setDeleteStaff] = useState(null);

  return (
    <div className="mt-8 bg-white rounded-2xl shadow overflow-hidden">

      <div className="px-6 py-5 border-b flex justify-between items-center">

    <div>
        <h2 className="text-2xl font-bold text-gray-800">
            Staff List
        </h2>

        <p className="text-gray-500 text-sm">
            Manage registered staff
        </p>
    </div>

    <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-6 py-4">

        <div>
            <h2 className="text-xl text-blue-700">
                 Total Staff {totalStaff}
            </h2>
        </div>

    </div>

</div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-blue-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Staff ID
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Name
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Role
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Phone
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {staff.length > 0 ? (
                staff.map((staff) => (
                <tr
                    key={staff.id}
                    className="border-b hover:bg-gray-50 transition"
                >
                    <td className="px-6 py-4 font-medium">
                    {staff.staffId}
                    </td>

                    <td className="px-6 py-4">
                    {staff.name}
                    </td>

                    <td className="px-6 py-4">
                    {staff.role}
                    </td>

                    <td className="px-6 py-4">
                    {staff.phone}
                    </td>

                    <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                        <button
                        onClick={() => onView(staff)}
                        className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                        View
                        </button>

                        <button
                        onClick={() => onEdit(staff)}
                        className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        >
                        Edit
                        </button>

                        <button
                        onClick={() => setDeleteStaff(staff)}
                        className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        >
                        Delete
                        </button>
                    </div>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td
                    colSpan="5"
                    className="text-center py-10 text-gray-500 text-lg"
                >
                    No staff found.
                </td>
                </tr>
            )}
            </tbody>

        </table>

      </div>

        {/* Delete Staff popup */}
        {deleteStaff && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                <div className="bg-white rounded-2xl p-8 w-[420px] shadow-xl">

                <h2 className="text-2xl font-bold text-red-600">
                    Delete Staff
                </h2>

                <p className="text-gray-600 mt-3">
                    Are you sure you want to delete
                    <span className="font-semibold">
                    {" "}{deleteStaff.name}
                    </span>
                    ?
                </p>

                <div className="flex justify-end gap-3 mt-8">

                    <button
                    onClick={() => setDeleteStaff(null)}
                    className="px-5 py-2 border rounded-lg"
                    >
                    Cancel
                    </button>

                    <button
                    onClick={() => {
                        onDelete(deleteStaff.id);
                        setDeleteStaff(null);
                    }}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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