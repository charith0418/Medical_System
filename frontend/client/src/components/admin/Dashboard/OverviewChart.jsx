import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Default trend fallback if data array is empty
const defaultMonthlyData = [
  { month: "May", patients: 1, appointments: 2 },
  { month: "Jun", patients: 2, appointments: 3 },
  { month: "Jul", patients: 3, appointments: 3 },
  { month: "Aug", patients: 4, appointments: 5 },
  { month: "Sep", patients: 4, appointments: 5 },
  { month: "Oct", patients: 5, appointments: 6 },
];

export default function OverviewChart({
  data = [],
  title = "System Overview",
}) {
  const chartData = Array.isArray(data) && data.length > 0 ? data : defaultMonthlyData;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-500 text-sm">Monthly System Statistics</p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 25, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "#E2E8F0" }} tick={{ fill: "#64748B", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={{ stroke: "#E2E8F0" }} tick={{ fill: "#64748B", fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                borderRadius: "12px",
                color: "#FFFFFF",
                border: "none",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line
              name="Patients"
              type="monotone"
              dataKey="patients"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 6 }}
            />
            <Line
              name="Appointments / Visits"
              type="monotone"
              dataKey="appointments"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}