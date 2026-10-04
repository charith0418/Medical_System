import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function OverviewChart({
  data = [],
  title = "System Overview",
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {title}
          </h2>

          <p className="text-gray-500 text-sm">
            Monthly System Statistics
          </p>
        </div>

      </div>

      <div className="h-80">

        {data.length > 0 ? (

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line
                dataKey="patients"
                stroke="#2563EB"
                strokeWidth={3}
              />

              <Line
                dataKey="appointments"
                stroke="#10B981"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        ) : (

          <div className="flex items-center justify-center h-full text-gray-400">
            No data available
          </div>

        )}

      </div>

    </div>
  );
}