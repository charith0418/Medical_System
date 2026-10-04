import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaUserEdit, FaTimes } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  // Replace hyphens with forward slashes for cross-browser Safari/Firefox compatibility
  const sanitizedDob = dob.replace(/-/g, '/');
  const diff = Date.now() - new Date(sanitizedDob).getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return age >= 0 ? age : 0;
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editPatient, setEditPatient] = useState(null);

  // Fetch real data directly from the Mongoose backend database with Auth Headers
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token'); 
        
        const response = await fetch(`${API_BASE_URL}/patients`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!response.ok) throw new Error("API not responding or unauthorized");
        const data = await response.json();
        
        if (data && data.length > 0) {
          const formattedPatients = data.map(p => ({
            _id: p._id, 
            patientId: p.patientId || "N/A",
            fullName: p.fullName || "Unnamed Patient",
            dob: p.dob ? p.dob.split('T')[0] : "", 
            bloodGroup: p.bloodGroup || "N/A",
            phone: p.phone || "N/A",
            address: p.address || "N/A",
            email: p.email || p.user?.email || "No email provided",
            lastVisit: p.updatedAt || p.lastVisit || new Date().toISOString()
          }));
          setPatients(formattedPatients);
        } else {
          setPatients([]); 
        }
      } catch (error) {
        console.error('Error fetching database records:', error);
        setPatients([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Filter real records based on user search query matching
  const filtered = patients.filter(p =>
    (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.patientId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Submit updates to persist changes into MongoDB storage with Auth Headers
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/patients/${editPatient._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editPatient.fullName,
          bloodGroup: editPatient.bloodGroup,
          phone: editPatient.phone,
          dob: editPatient.dob,
          address: editPatient.address
        })
      });

      if (!response.ok) throw new Error("Failed to update profile values on backend");

      // Update state array
      setPatients(prev => prev.map(p => p._id === editPatient._id ? editPatient : p));
      
      // Update details modal if currently viewing the modified patient
      if (selectedPatient && selectedPatient._id === editPatient._id) {
        setSelectedPatient(editPatient);
      }

      setEditPatient(null);
    } catch (err) {
      console.error("Failed saving edits:", err);
      alert("Error saving record adjustments to backend server.");
    }
  };

  return (
    <div className="space-y-6 w-full text-[#1e293b]">
      {/* Search Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div className="w-full max-w-md bg-white p-3 rounded-2xl border border-slate-200 flex items-center focus-within:border-[#078a72] focus-within:ring-2 focus-within:ring-[#078a72]/10 transition-all">
          <div className="text-slate-400 px-3 text-lg"><FaSearch /></div>
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent py-1 outline-hidden text-base text-slate-800 placeholder-slate-400"
          />
        </div>
        <div className="text-base font-semibold text-slate-500">
          Showing <span className="text-[#078a72] font-bold text-lg">{filtered.length}</span> patient profiles
        </div>
      </div>

      {/* Main Table Card */}
      <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-[#078a72] rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-semibold text-base">Loading patients list...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-semibold text-lg">No registered patients found matching your search.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-sm font-bold uppercase tracking-wider text-slate-500/80">
                  <th className="p-6 pl-8">Patient ID</th>
                  <th className="p-6">Name</th>
                  <th className="p-6">Age</th>
                  <th className="p-6">Blood Group</th>
                  <th className="p-6">Last Visit</th>
                  <th className="p-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-base divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((p) => (
                  // FIXED: key assigned to unique Database ID (_id) instead of nullable patientId
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 pl-8 text-[#078a72] font-bold font-mono tracking-tight text-lg">{p.patientId}</td>
                    <td className="p-6">
                      <div>
                        <p className="text-slate-900 font-bold text-lg">{p.fullName}</p>
                        <p className="text-sm text-slate-400 font-normal mt-0.5">{p.email}</p>
                      </div>
                    </td>
                    <td className="p-6 text-slate-600 font-semibold text-lg">{calculateAge(p.dob)} Yrs</td>
                    <td className="p-6">
                      <span className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-xl font-mono font-bold text-sm">
                        {p.bloodGroup || 'N/A'}
                      </span>
                    </td>
                    <td className="p-6 text-slate-500 font-medium text-sm">
                      {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center space-x-3">
                        <button 
                          onClick={() => setSelectedPatient(p)}
                          className="text-[#078a72] hover:bg-[#078a72]/10 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <FaEye className="text-base" />
                          <span className="text-sm font-bold">View</span>
                        </button>
                        <button 
                          onClick={() => setEditPatient({ ...p })}
                          className="text-slate-500 hover:bg-slate-100 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <FaUserEdit className="text-base" />
                          <span className="text-sm font-bold">Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#078a72] p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md">Patient File</span>
                <h3 className="text-2xl font-black mt-1.5">{selectedPatient.fullName}</h3>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-white/80 hover:text-white text-2xl cursor-pointer">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Patient ID</p>
                  <p className="font-bold font-mono text-slate-800 text-lg mt-0.5">{selectedPatient.patientId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Blood Group</p>
                  <p className="font-bold text-rose-600 text-lg mt-0.5">{selectedPatient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Date of Birth</p>
                  <p className="font-bold text-slate-800 text-lg mt-0.5">{selectedPatient.dob}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Age</p>
                  <p className="font-bold text-slate-800 text-lg mt-0.5">{calculateAge(selectedPatient.dob)} Years</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Phone</p>
                  <p className="font-bold text-slate-800 text-lg mt-0.5">{selectedPatient.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email Address</p>
                <p className="font-semibold text-slate-800 text-base mt-0.5">{selectedPatient.email || 'N/A'}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Residential Address</p>
                <p className="font-semibold text-slate-800 text-base mt-0.5">{selectedPatient.address || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 flex justify-end">
              <button 
                onClick={() => setSelectedPatient(null)}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-base rounded-xl transition cursor-pointer"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL */}
      {editPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#078a72] p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md">Modify Record</span>
                <h3 className="text-2xl font-black mt-1.5">Edit Patient</h3>
              </div>
              <button type="button" onClick={() => setEditPatient(null)} className="text-white/80 hover:text-white text-2xl cursor-pointer">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={editPatient.fullName}
                  onChange={e => setEditPatient(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#078a72] outline-hidden text-base font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Blood Group</label>
                  <select 
                    value={editPatient.bloodGroup}
                    onChange={e => setEditPatient(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#078a72] outline-hidden text-base font-semibold text-slate-800"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    value={editPatient.phone}
                    onChange={e => setEditPatient(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#078a72] outline-hidden text-base font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date of Birth</label>
                <input 
                  type="date" 
                  value={editPatient.dob}
                  onChange={e => setEditPatient(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#078a72] outline-hidden text-base font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={editPatient.email}
                  onChange={e => setEditPatient(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#078a72] outline-hidden text-base font-semibold text-slate-800"
                  disabled
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Home Address</label>
                <textarea 
                  value={editPatient.address}
                  onChange={e => setEditPatient(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#078a72] outline-hidden text-base font-semibold text-slate-800 h-24 resize-none"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-5 flex justify-end space-x-3">
              <button 
                type="button"
                onClick={() => setEditPatient(null)}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-base rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-3 bg-[#078a72] hover:bg-[#06735f] text-white font-bold text-base rounded-xl transition cursor-pointer shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Patients;