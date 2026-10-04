import React from "react";
import {
  FaUser,
  FaUserMd,
  FaCalendarCheck,
  FaFileMedical,
} from "react-icons/fa";

const iconMap = {
  patient: <FaUser className="text-blue-600" />,
  doctor: <FaUserMd className="text-green-600" />,
  appointment: <FaCalendarCheck className="text-orange-500" />,
  report: <FaFileMedical className="text-red-500" />,
};

export default function ActivityLogs({
  logs = [],
  title = "Recent Activity Logs",
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {title}
          </h2>

          <p className="text-sm text-gray-500">
            Latest activities from the system
          </p>
        </div>

      </div>

      {/* Body */}
      {logs.length === 0 ? (

        <div className="h-72 flex items-center justify-center text-gray-400">
          No activity available
        </div>

      ) : (

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">

          {logs.map((log) => (

            <div
              key={log.id}
              className="flex items-start justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
            >

              <div className="flex gap-4">

                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                  {iconMap[log.type] || (
                    <FaUser className="text-gray-500" />
                  )}
                </div>

                <div>

                  <h3 className="font-semibold text-gray-800">
                    {log.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {log.description}
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="text-sm font-medium text-gray-700">
                  {log.time}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {log.date}
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}