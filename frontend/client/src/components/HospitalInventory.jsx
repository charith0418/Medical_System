import React, { useState, useEffect } from 'react';
import { 
  FaCapsules, FaPlus, FaSearch, FaExclamationTriangle, 
  FaTrash, FaBoxOpen, FaLayerGroup, FaHistory, FaCheckCircle, FaTimes 
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

// Dynamically resolve live Render backend URL and ensure single /api route prefix
const rawUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://medical-system-5fwx.onrender.com';

const CLEAN_BASE_URL = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
const API_URL = `${CLEAN_BASE_URL}/api/medicines`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Fallback master list containing valid 24-character hexadecimal MongoDB ObjectIds
const DEFAULT_HOSPITAL_MASTER = [
  { 
    _id: '6aadff395f2bc59b1943b462', 
    medicineCode: 'MED-001', 
    medicineName: 'Paracetamol 500mg', 
    categoryClass: 'Analgesic (Pain Relief)', 
    unitForm: 'Tablets' 
  },
  { 
    _id: '6aadff395f2bc59b1943b463', 
    medicineCode: 'MED-002', 
    medicineName: 'Amoxicillin 500mg', 
    categoryClass: 'Antibiotics', 
    unitForm: 'Capsules' 
  },
  { 
    _id: '6aadff395f2bc59b1943b464', 
    medicineCode: 'MED-003', 
    medicineName: 'Ibuprofen 400mg', 
    categoryClass: 'NSAID / Anti-inflammatory', 
    unitForm: 'Tablets' 
  },
  { 
    _id: '6aadff395f2bc59b1943b465', 
    medicineCode: 'MED-004', 
    medicineName: 'Cetirizine 10mg', 
    categoryClass: 'Antihistamine (Allergy)', 
    unitForm: 'Tablets' 
  },
  { 
    _id: '6aadff395f2bc59b1943b466', 
    medicineCode: 'MED-005', 
    medicineName: 'Omeprazole 20mg', 
    categoryClass: 'Antacid', 
    unitForm: 'Capsules' 
  }
];

const HospitalInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [masterList, setMasterList] = useState(DEFAULT_HOSPITAL_MASTER); 
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const DEFAULT_LOCATION = 'Pharmacy Main Shelf A';

  const [newMed, setNewMed] = useState({
    medicineMasterId: '', 
    selectedName: '',     
    quantity: '',
    storageLocation: DEFAULT_LOCATION
  });

  const loadInitialData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Fetch current inventory stock from backend
      const stockRes = await fetch(API_URL, { headers: getAuthHeaders() });
      if (stockRes.ok) {
        const stockRaw = await stockRes.json();
        const stockData = Array.isArray(stockRaw) ? stockRaw : stockRaw?.data || [];
        setInventory(stockData);
      }

      // 2. Fetch master list directly from database collection
      try {
        const masterRes = await fetch(`${API_URL}/master-list`, { headers: getAuthHeaders() });
        if (masterRes.ok) {
          const masterRaw = await masterRes.json();
          const masterData = Array.isArray(masterRaw) ? masterRaw : masterRaw?.data || [];
          if (masterData.length > 0) {
            setMasterList(masterData);
          }
        }
      } catch {
        console.info("Master-list endpoint unavailable, utilizing local fallback master list.");
      }
    } catch (err) {
      console.error("Initial load error:", err);
      setErrorMessage("Could not connect to medicine database server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter master list as user types
  const handleNameType = (e) => {
    const val = e.target.value;
    setNewMed(prev => ({ ...prev, selectedName: val, medicineMasterId: '' }));
    setErrorMessage("");

    if (val.trim().length > 0) {
      const cleanVal = val.trim().toLowerCase();
      const matches = masterList.filter(item => {
        const name = (item.medicineName || item.name || "").toLowerCase();
        const code = (item.medicineCode || item.code || "").toLowerCase();
        return name.includes(cleanVal) || code.includes(cleanVal);
      }).slice(0, 8);

      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Map the genuine 24-character hexadecimal ObjectId to medicineMasterId
  const handleSelectDrug = (item) => {
    setNewMed(prev => ({
      ...prev,
      selectedName: item.medicineName || item.name || "",
      medicineMasterId: item._id
    }));
    setShowSuggestions(false);
    setErrorMessage("");
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newMed.medicineMasterId) {
      setErrorMessage("Spelling Verification Error: You must pick an approved option from the search suggestions dropdown menu.");
      return;
    }

    setIsSubmitting(true);
    const saveToast = toast.loading("Saving medicine entry...");

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          medicineMasterId: newMed.medicineMasterId,
          quantity: Number(newMed.quantity) || 1,
          storageLocation: newMed.storageLocation
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error (${response.status})`);
      }
      
      const resData = await response.json();
      const addedRow = resData.medicine || resData.data || resData;
      
      setInventory(prev => [addedRow, ...prev]);

      // Trigger On-Screen Banner
      const successText = `Medicine "${newMed.selectedName}" (${newMed.quantity} units) saved successfully!`;
      setSuccessMessage(successText);
      setTimeout(() => setSuccessMessage(""), 5000);

      // Trigger Toast Popup
      toast.success(successText, {
        id: saveToast,
        duration: 4000,
        style: { background: '#078a72', color: '#ffffff', fontWeight: 'bold' }
      });
      
      // Reset input form
      setNewMed({ 
        medicineMasterId: '', 
        selectedName: '', 
        quantity: '', 
        storageLocation: DEFAULT_LOCATION 
      });
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(`Error: ${err.message}`, { id: saveToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItem = async (id) => {
    if (!window.confirm("Permanently remove this stock item?")) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Deletion failed on server.");
      setInventory(prev => prev.filter(item => item._id !== id));
      toast.success("Item removed from inventory");
    } catch (err) {
      alert(err.message);
    }
  };

  const totalStockItems = inventory.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const lowStockAlerts = inventory.filter(item => (Number(item.quantity) || 0) <= 20).length;

  const filteredView = inventory.filter(item => {
    const target = item.medicineMasterId?.medicineName || item.medicineMasterId?.name || "";
    return target.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 space-y-8 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center justify-between text-left transition-all animate-fadeIn">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle /> {errorMessage}
          </div>
          <button onClick={() => setErrorMessage("")} className="text-red-400 hover:text-red-600 cursor-pointer">
            <FaTimes />
          </button>
        </div>
      )}

      {/* SUCCESS BANNER */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-bold flex items-center justify-between text-left shadow-sm transition-all animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <FaCheckCircle className="text-emerald-600 text-lg shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-500 hover:text-emerald-700 cursor-pointer p-1">
            <FaTimes />
          </button>
        </div>
      )}

      {/* STATUS COUNTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-left">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Active Units</p>
            <h3 className="text-3xl font-black text-slate-950 mt-1 font-mono">{totalStockItems}</h3>
          </div>
          <div className="p-4 bg-teal-50 text-[#078a72] rounded-xl text-2xl"><FaBoxOpen /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-left">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tracked Items</p>
            <h3 className="text-3xl font-black text-slate-950 mt-1 font-mono">{inventory.length}</h3>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl text-2xl"><FaLayerGroup /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-left">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shortages</p>
            <h3 className={`text-3xl font-black mt-1 font-mono ${lowStockAlerts > 0 ? 'text-red-600' : 'text-slate-950'}`}>{lowStockAlerts}</h3>
          </div>
          <div className={`p-4 rounded-xl text-2xl ${lowStockAlerts > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}><FaExclamationTriangle /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* ENTRY INPUT CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 text-left">
          <div className="pb-4 border-b border-slate-100 mb-6">
            <h3 className="text-lg font-black text-slate-950">Stock Entry Deck</h3>
            <p className="text-xs text-slate-400 mt-1">Select verified spellings to prevent layout typos.</p>
          </div>

          <form onSubmit={handleAddInventory} className="space-y-4">
            <div className="relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Medicine Name Lookup
              </label>
              <input 
                type="text" 
                value={newMed.selectedName} 
                placeholder="Type name (e.g., Paracetamol)..." 
                onChange={handleNameType} 
                onFocus={() => newMed.selectedName.trim().length > 0 && setShowSuggestions(true)}
                className={`w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none transition-all text-slate-950 ${newMed.medicineMasterId ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-slate-200 focus:ring-2 focus:ring-[#078a72]'}`} 
                required 
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 z-50">
                  {suggestions.map((item) => (
                    <li 
                      key={item._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectDrug(item);
                      }}
                      className="p-3 text-sm text-slate-700 hover:bg-emerald-50 cursor-pointer flex flex-col items-start transition-colors"
                    >
                      <span className="font-bold text-slate-900">{item.medicineName || item.name}</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                        {item.medicineCode || item.code || "MED"} • {item.categoryClass || item.category || "General"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={newMed.quantity} 
                  placeholder="100" 
                  onChange={(e) => setNewMed({...newMed, quantity: e.target.value})} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none text-slate-950" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Location</label>
                <select 
                  value={newMed.storageLocation} 
                  onChange={(e) => setNewMed({...newMed, storageLocation: e.target.value})} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none text-slate-950 cursor-pointer" 
                  required
                >
                  <option value="Pharmacy Main Shelf A">Pharmacy Main Shelf A</option>
                  <option value="Pharmacy Main Shelf B">Pharmacy Main Shelf B</option>
                  <option value="Emergency Ward (ER)">Emergency Ward (ER)</option>
                  <option value="ICU Cabinet A">ICU Cabinet A</option>
                  <option value="General Store Room 1">General Store Room 1</option>
                  <option value="Cold Storage Fridge 1">Cold Storage Fridge 1</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-3.5 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#078a72] hover:bg-[#056b58]'
              }`}
            >
              <FaPlus className="text-xs" /> {isSubmitting ? 'Saving Entry...' : 'Save Entry'}
            </button>
          </form>
        </div>

        {/* LOGISTICS DATA TABLE */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-xs border border-slate-200 text-left min-h-[500px] flex flex-col justify-between">
          <div>
            <div className="flex w-full bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#078a72] mb-6">
              <div className="pl-4 flex items-center justify-center text-slate-400"><FaSearch /></div>
              <input 
                type="text" 
                placeholder="Search active stock items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-3.5 outline-none text-sm font-medium text-slate-950 placeholder-slate-400"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="text-center py-12 text-sm text-slate-400 font-semibold animate-pulse">Syncing logs database...</div>
                ) : filteredView.length === 0 ? (
                  <div className="text-center py-12 text-sm text-slate-400 font-medium">No inventory stock items found. Add one on the left.</div>
                ) : (
                  <table className="w-full text-sm text-left text-slate-600 min-w-[600px]">
                    <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50/70 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Medicine Name</th>
                        <th className="px-6 py-4">Class</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredView.map((item) => {
                        const master = item.medicineMasterId || {};
                        const isLow = (Number(item.quantity) || 0) <= 20;
                        const tableName = master.medicineName || master.name || item.name || "Unknown Variant";
                        return (
                          <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-400">{master.medicineCode || master.code || "N/A"}</td>
                            <td className="px-6 py-4 font-bold text-slate-950">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-lg text-sm ${isLow ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-[#078a72]'}`}><FaCapsules /></div>
                                <span>{tableName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4"><span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">{master.categoryClass || master.category || "General"}</span></td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-mono font-bold text-slate-900">{item.quantity} <span className="text-xs text-slate-400 font-sans font-medium">{master.unitForm || 'Units'}</span></span>
                                {isLow ? <span className="text-[10px] text-red-600 font-bold">⚠️ Low Stock</span> : <span className="text-[10px] text-emerald-600 font-bold">✓ Secure</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">{item.storageLocation}</td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => handleRemoveItem(item._id)} className="text-slate-300 hover:text-red-500 p-2 rounded-lg transition-all cursor-pointer"><FaTrash className="text-xs" /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center font-medium">
            <span className="flex items-center gap-1.5"><FaHistory /> Verification active</span>
            <span className="bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600">Total Lines: <strong className="font-mono text-slate-900">{filteredView.length}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HospitalInventory;