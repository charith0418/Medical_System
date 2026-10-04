import React from "react";

export default function StatCard({
  title,
  value,
  change,
  icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
  positive = true,
  loading = false,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition duration-300">

      <div className="flex justify-between items-start">

        {/* Left */}
        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          {loading ? (
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse mt-3"></div>
          ) : (
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {value ?? "--"}
            </h2>
          )}

          {!loading && change && (
            <span
              className={`inline-flex items-center mt-4 px-3 py-1 rounded-full text-xs font-semibold ${
                positive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {change}
            </span>
          )}

        </div>

        {/* Right */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}