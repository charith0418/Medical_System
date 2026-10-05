import React from "react";
import {
  FaUser,
  FaUserMd,
  FaUserNurse,
  FaCalendarCheck,
  FaFileMedical,
} from "react-icons/fa";

const iconMap = {
  patient: <FaUser className="text-blue-600" />,
  doctor: <FaUserMd className="text-emerald-600" />,
  staff: <FaUserNurse className="text-purple-600" />,
  appointment: <FaCalendarCheck className="text-orange-500" />,
  report: <FaFileMedical className="text-rose-500" />,
};

const defaultActivityList = [
  {
    id: "d1",
    type: "patient",
    title: "New Patient Registered",
    description: "Charith Kalhara (PAT-348741) enrolled in the Medicare system",
    time: "10:48 AM",
    date: "2026-10-05",
  },
  {
    id: "d2",
    type: "appointment",
    title: "Medical Consultation Completed",
    description: "General Visit diagnosis recorded with Dr. Charith Kalhara",
    time: "10:30 AM",
    date: "2026-10-05",
  },
  {
    id: "d3",
    type: "report",
    title: "Prescription Issued",
    description: "Ibuprofen 400mg (3 Days course) prescribed for patient",
    time: "09:15 AM",
    date: "2026-10-05",
  },
  {
    id: "d4",
    type: "doctor",
    title: "Doctor Profile Verified",
    description: "Medical Officer credentials active at Outpatient Department",
    time: "08:45 AM",
    date: "2026-10-05",
  },
];

export default function ActivityLogs({
  logs = [],
  title = "Recent Activity Logs",
}) {
  const displayLogs = Array.isArray(logs) && logs.length > 0 ? logs : defaultActivityList;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-left">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">Latest activities from the system</p>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {displayLogs.map((log, index) => (
          <div
            key={log.id || index}
            className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50/80 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0">
                {iconMap[log.type] || <FaUser className="text-gray-500" />}
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  {log.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {log.description}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 ml-4">
              <p className="text-xs font-semibold text-gray-700">
                {log.time || "Recent"}
              </p>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                {log.date || ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}