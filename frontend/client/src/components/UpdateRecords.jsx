import React, { useState } from "react";

export default function UpdateRecords() {
  const [patientId, setPatientId] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    bloodGroup: "",
    status: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 1. රෝගියාගේ වත්මන් දත්ත Backend එකෙන් සොයා ගැනීම (Fetch Data)
  const handleFetchPatient = async (e) => {
    e.preventDefault();
    if (!patientId) return;
    
    setLoading(true);
    setMessage("");
    try {
      // Backend Endpoint: GET /api/patients/:id
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) throw new Error("Patient not found!");
      
      const data = await response.json();
      setFormData({
        fullName: data.fullName || "",
        phone: data.phone || "",
        address: data.address || "",
        bloodGroup: data.bloodGroup || "",
        status: data.status || "Pending"
      });
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. වෙනස් කළ දත්ත Database එකට Save කිරීම (Update Data)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend Endpoint: PUT /api/patients/:id
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("✅ Patient records updated successfully!");
      } else {
        throw new Error("Failed to update records.");
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">🔄 Update Patient Records</h2>
      
      {/* 🔍 Step 1: Search Patient ID */}
      <form onSubmit={handleFetchPatient} className="flex gap-3 border-b border-slate-100 pb-6">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Enter Patient ID</label>
          <input
            type="text"
            placeholder="e.g., P10024"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button type="submit" className="self-end px-5 py-2.5 bg-slate-800 text-white font-medium text-sm rounded-xl hover:bg-slate-700 transition">
          {loading ? "Searching..." : "Fetch Data"}
        </button>
      </form>

      {message && <p className="text-sm font-medium text-center">{message}</p>}

      {/* ✍️ Step 2: Edit Form */}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Blood Group</label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Address</label>
          <textarea
            rows="3"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/10"
        >
          {loading ? "Saving Changes..." : "Save Updated Records"}
        </button>
      </form>
    </div>
  );
}