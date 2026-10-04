import { X } from "lucide-react";

export default function ViewStaffModal({
  open,
  onClose,
  staff,
}) {
  if (!open || !staff) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}

        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">

          <div>
            <h2 className="text-2xl font-bold">
              Staff Details
            </h2>

            <p className="text-sm text-cyan-100">
              View staff information
            </p>
          </div>

          <button onClick={onClose}>
            <X size={26} />
          </button>

        </div>

        {/* Body */}

        <div className="p-8 grid grid-cols-2 gap-6">

          <div>
            <label className="text-gray-500 text-sm">
              Staff ID
            </label>

            <p className="font-semibold mt-1">
              {staff.staffId}
            </p>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              Name
            </label>

            <p className="font-semibold mt-1">
              {staff.name}
            </p>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              Email
            </label>

            <p className="font-semibold mt-1">
              {staff.email}
            </p>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              Phone
            </label>

            <p className="font-semibold mt-1">
              {staff.phone}
            </p>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              NIC
            </label>

            <p className="font-semibold mt-1">
              {staff.nic}
            </p>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              Role
            </label>

            <p className="font-semibold mt-1">
              {staff.role}
            </p>
          </div>

        </div>

        {/* Footer */}

        <div className="border-t px-6 py-4 flex justify-end">

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}