import React from "react";

const patientRows = [
  { name: "John Doe", id: "P10024", date: "20 May 2026" },
  { name: "Maria Fernando", id: "P10018", date: "20 May 2026" },
  { name: "David Perera", id: "P10011", date: "19 May 2026" },
];

export default function RecentPatientsTable() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <h3 className="text-gray-800 font-bold mb-4">Recent Patients</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-medium">
              <th className="pb-3">Patient</th>
              <th className="pb-3">ID</th>
              <th className="pb-3">Date</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {patientRows.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                <td className="py-3 font-medium text-slate-700">{p.name}</td>
                <td className="py-3 text-slate-500">{p.id}</td>
                <td className="py-3 text-slate-400">{p.date}</td>
                <td className="py-3 text-right">
                  <button className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg text-xs font-semibold transition">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}