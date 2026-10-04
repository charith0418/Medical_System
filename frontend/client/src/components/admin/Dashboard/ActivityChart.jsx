import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function ActivityChart({
  data = [],
  title = "System Activity",
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {title}
        </h2>

        <p className="text-sm text-gray-500">
          Distribution of system data
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">

        {data.length > 0 ? (

          <ResponsiveContainer width="100%" height="100%">

            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        ) : (

          <div className="flex justify-center items-center h-full text-gray-400">
            No activity data available
          </div>

        )}

      </div>

    </div>
  );
}