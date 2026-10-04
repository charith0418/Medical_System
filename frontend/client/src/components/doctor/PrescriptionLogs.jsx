import React, { useState } from "react";
import { 
  FileCheck2, Search, Download, Printer, 
  Pill, Eye, CalendarCheck2, ArrowLeft, CheckCircle, ShieldCheck 
} from "lucide-react";

const mockPrescriptions = [
  { rxId: "RX-2026-9921", ptId: "PT-2026-084", name: "John Doe", date: "2026-07-10", medications: ["Tab. Paracetamol 500mg (TDS x 3 Days)", "Syr. Amoxicillin 125mg/5ml (BD x 5 Days)"], prescriber: "Dr. Asela Perera", systemHash: "SHA256::8f9a2c4e" },
  { rxId: "RX-2026-9945", ptId: "PT-2026-119", name: "Chanchala Madhushani", date: "2026-07-18", medications: ["Tab. Cetirizine 10mg (Nocte x 1 Week)"], prescriber: "Dr. Asela Perera", systemHash: "SHA256::3b7e9f1a" },
  { rxId: "RX-2026-9989", ptId: "PT-2026-302", name: "Kamal Perera", date: "2026-06-02", medications: ["Cap. Omeprazole 20mg (Om x 14 Days)"], prescriber: "Dr. Asela Perera", systemHash: "SHA256::9c2d5e7b" }
];

export default function PrescriptionLogs() {
  const [search, setSearch] = useState("");
  const [activeAction, setActiveAction] = useState({ type: null, targetId: null });

  const filteredLogs = mockPrescriptions.filter(log => 
    log.name.toLowerCase().includes(search.toLowerCase()) ||
    log.rxId.toLowerCase().includes(search.toLowerCase())
  );

  const currentSelection = mockPrescriptions.find(p => p.rxId === activeAction.targetId);

  // ACTION INTERFACE VISUALIZER: PRINT PREVIEW MODE
  if (activeAction.type === "print" && currentSelection) {
    return (
      <div className="w-full max-w-3xl mx-auto p-8 space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 no-print">
          <button onClick={() => setActiveAction({ type: null, targetId: null })} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Return to Ledger
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 bg-[#008060] hover:bg-[#005e46] text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm">
            <Printer className="h-4 w-4" /> Trigger Browser Print
          </button>
        </div>

        <div className="bg-white border-2 border-slate-300 p-8 rounded-xl shadow-md space-y-8 font-serif text-slate-900 relative">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-wide text-slate-800">Apex General Hospital</h2>
            <p className="text-xs font-sans text-slate-500 font-semibold">Outpatient Dispensary & Clinical Services Division</p>
          </div>

          <div className="grid grid-cols-2 text-xs font-sans gap-2 border-y border-slate-200 py-4">
            <div><strong>Patient Name:</strong> {currentSelection.name}</div>
            <div><strong>Date:</strong> {currentSelection.date}</div>
            <div><strong>Registration ID:</strong> {currentSelection.ptId}</div>
            <div><strong>Rx Order Token:</strong> {currentSelection.rxId}</div>
          </div>

          <div className="space-y-4 py-4 min-h-[160px]">
            <span className="text-3xl font-bold font-sans text-slate-300 block">℞</span>
            <ul className="space-y-3 pl-6 list-decimal font-sans font-bold text-base text-slate-800">
              {currentSelection.medications.map((m, i) => (
                <li key={i} className="tracking-tight">{m}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-200 pt-6 flex justify-between items-end font-sans">
            <div className="text-[10px] text-slate-400 font-mono">
              Cryptographic Receipt:<br />
              {currentSelection.systemHash}
            </div>
            <div className="text-center w-48 border-t border-slate-400 pt-2">
              <p className="text-xs font-bold text-slate-800">{currentSelection.prescriber}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTION INTERFACE VISUALIZER: MANIFEST MANIFESTATION OVERLAY
  if (activeAction.type === "view" && currentSelection) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6 animate-fadeIn">
        <button onClick={() => setActiveAction({ type: null, targetId: null })} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Close Manifest View
        </button>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold bg-[#008060]/10 text-[#008060] px-2.5 py-1 rounded-md font-mono">{currentSelection.rxId}</span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">Pharmaceutical Manifest Report</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="h-4 w-4" /> Secured Ledger Entry
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="bg-slate-50/60 p-4 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">Target Account</span>
                <span className="font-bold text-slate-900 block text-base">{currentSelection.name}</span>
                <span className="font-mono text-xs text-slate-400">{currentSelection.ptId}</span>
              </div>
              <div className="bg-slate-50/60 p-4 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">Clinical Signee</span>
                <span className="font-bold text-slate-900 block text-base">{currentSelection.prescriber}</span>
                <span className="font-mono text-xs text-slate-400">Hospital Staff Medical ID Verified</span>
              </div>
              <div className="bg-slate-50/60 p-4 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">Audit Checksum Hash</span>
                <span className="font-mono font-bold text-slate-700 block text-sm pt-1">{currentSelection.systemHash}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Allocated Formulary List</h4>
              <div className="space-y-2">
                {currentSelection.medications.map((m, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 shadow-2xs">
                    <div className="p-2 bg-slate-100 rounded-lg text-[#008060]"><Pill className="h-4 w-4" /></div>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prescription Audit Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Legally binding records of pharmaceutical orders generated during clinical shifts.</p>
        </div>
        <div>
          <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-xs">
            <Download className="h-3.5 w-3.5 text-slate-500" /> Export Shift Logs
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Rx System Token ID or Patient Identity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008060] text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <th className="p-4 w-44">Rx Token ID</th>
                <th className="p-4">Target Recipient</th>
                <th className="p-4 w-40">Timestamp</th>
                <th className="p-4">Formulary Line Items</th>
                <th className="p-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.rxId} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900 text-xs tracking-tight">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-slate-400 shrink-0" />
                      {log.rxId}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{log.name}</div>
                    <div className="text-xs text-slate-400 font-mono font-normal mt-0.5">{log.ptId}</div>
                  </td>
                  <td className="p-4 text-xs font-normal text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck2 className="h-3.5 w-3.5 text-slate-400" />
                      {log.date}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 max-w-lg">
                      {log.medications.map((m, idx) => (
                        <div key={idx} className="inline-flex items-center gap-1.5 text-xs bg-slate-100/80 border border-slate-200/60 rounded-md px-2.5 py-1 font-semibold text-slate-700">
                          <Pill className="h-3 w-3 text-[#008060] shrink-0" />
                          {m}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => setActiveAction({ type: "print", targetId: log.rxId })}
                        title="Print Script" 
                        className="p-2 text-slate-400 hover:text-[#008060] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setActiveAction({ type: "view", targetId: log.rxId })}
                        title="View Full Manifest" 
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}