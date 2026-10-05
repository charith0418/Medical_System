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

export default function OverviewChart({
  data = [],
  title = "System Overview",
}) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-500 text-sm">Monthly System Statistics</p>
        </div>
      </div>

      <div className="h-80">
        {safeData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
              <YAxis tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                name="Patients"
                type="monotone"
                dataKey="patients"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Appointments / Visits"
                type="monotone"
                dataKey="appointments"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 font-medium">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}