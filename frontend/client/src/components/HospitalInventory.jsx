import React, { useState, useEffect } from 'react';
import { 
  FaCapsules, FaPlus, FaSearch, FaExclamationTriangle, 
  FaTrash, FaBoxOpen, FaLayerGroup, FaHistory 
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/medicines';

// Helper function to calculate similarity score between two strings (0.0 to 1.0)
const getFuzzyScore = (str1, str2) => {
  if (!str1 || !str2) return 0.0;
  const s1 = String(str1).toLowerCase().replace(/\s+/g, '');
  const s2 = String(str2).toLowerCase().replace(/\s+/g, '');
  
  if (s1 === s2) return 1.0; 
  if (s1.includes(s2) || s2.includes(s1)) return 0.7; 
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str) => {
    const bigrams = new Set();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const bigrams1 = getBigrams(s1);
  const bigrams2 = getBigrams(s2);
  
  let intersection = 0;
  for (const bigram of bigrams1) {
    if (bigrams2.has(bigram)) intersection++;
  }

  return (2.0 * intersection) / (bigrams1.size + bigrams2.size);
};

const HospitalInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [masterList, setMasterList] = useState([]); 
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Default fallback location that satisfies the backend model enum array parameters
  const DEFAULT_LOCATION = 'Pharmacy Main Shelf A';

  const [newMed, setNewMed] = useState({
    medicineMasterId: '', 
    selectedName: '',     
    quantity: '',
    storageLocation: DEFAULT_LOCATION // Defaulted to pass backend validation rules safely
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [stockRes, masterRes] = await Promise.all([
          fetch(API_URL),
          fetch(`${API_URL}/master-list`)
        ]);

        if (!stockRes.ok || !masterRes.ok) throw new Error("Database network authentication error.");
        
        const stockData = await stockRes.json();
        const masterData = await masterRes.json();

        console.log("DEBUG: Raw master list array loaded from database API:", masterData);

        setInventory(stockData);
        setMasterList(masterData);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleNameType = (e) => {
    const val = e.target.value;
    setNewMed(prev => ({ ...prev, selectedName: val, medicineMasterId: '' }));

    if (val.trim().length > 0) {
      console.log(`DEBUG: User typed "${val}". Evaluating against master list items...`);
      
      const scoredMatches = masterList.map(item => {
        const actualName = item.medicineName || item.name || item.drugName || "";
        
        return {
          ...item,
          displayName: actualName, 
          score: getFuzzyScore(actualName, val)
        };
      });

      const matches = scoredMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); 

      console.log("DEBUG: Final computed search matches list:", matches);

      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectDrug = (item) => {
    setNewMed(prev => ({
      ...prev,
      selectedName: item.displayName || item.medicineName || item.name || "",
      medicineMasterId: item._id
    }));
    setShowSuggestions(false);
    setErrorMessage("");
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!newMed.medicineMasterId) {
      setErrorMessage("Spelling Verification Error: You must pick an approved option from the search suggestions dropdown menu.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineMasterId: newMed.medicineMasterId,
          quantity: Number(newMed.quantity),
          storageLocation: newMed.storageLocation
        })
      });

      if (!response.ok) {
        // Attempt to capture the specific Mongoose reason string from response stream
        const errorData = await response.json();
        throw new Error(errorData.message || "Entry rejection rules processed by remote server.");
      }
      
      const resData = await response.json();
      
      // Backend structured response includes populated row data inside the 'medicine' key
      setInventory([resData.medicine, ...inventory]);
      
      // Clean form states and return to system default tracking locations safely
      setNewMed({ 
        medicineMasterId: '', 
        selectedName: '', 
        quantity: '', 
        storageLocation: DEFAULT_LOCATION 
      });
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleRemoveItem = async (id) => {
    if (!window.confirm("Permanently remove this item entry row?")) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Deletion failed.");
      setInventory(inventory.filter(item => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const totalStockItems = inventory.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const lowStockAlerts = inventory.filter(item => item.quantity <= 20).length;

  const filteredView = inventory.filter(item => {
    const target = item.medicineMasterId?.medicineName || item.medicineMasterId?.name || "";
    return target.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 space-y-8 p-6">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2 text-left">
          <FaExclamationTriangle /> {errorMessage}
        </div>
      )}

      {/* DASHBOARD STATUS CARDS */}
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Medicine Name Lookup</label>
              <input 
                type="text" 
                value={newMed.selectedName} 
                placeholder="Type name (e.g., Paracetamol)..." 
                onChange={handleNameType} 
                onFocus={() => newMed.selectedName.trim().length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className={`w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none transition-all text-slate-950 ${newMed.medicineMasterId ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500' : 'border-slate-200 focus:ring-2 focus:ring-[#078a72]'}`} 
                required 
              />
              
              {/* Dropdown Box Menu */}
              {showSuggestions && suggestions.length > 0 && (
                <ul 
                  className="absolute left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100"
                  style={{ zIndex: 9999 }}
                >
                  {suggestions.map((item) => (
                    <li 
                      key={item._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectDrug(item);
                      }}
                      className="p-3 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer flex flex-col items-start"
                    >
                      <span className="font-bold text-slate-900">{item.displayName || "Named Variant Missing"}</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                        {item.medicineCode || item.code || "No Code"} • {item.categoryClass || item.category || "General"}
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
                  value={newMed.quantity} 
                  placeholder="100" 
                  onChange={(e) => setNewMed({...newMed, quantity: e.target.value})} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none text-slate-950" 
                  required 
                />
              </div>
              
              {/* DROPDOWN LOCATION SELECT FIELD */}
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

            <button type="submit" className="w-full py-3.5 bg-[#078a72] hover:bg-[#056b58] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <FaPlus className="text-xs" /> Save Entry
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
                        const isLow = item.quantity <= 20;
                        const tableName = master.medicineName || master.name || "Unknown Variant";
                        return (
                          <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-400">{master.medicineCode || master.code || "N/A"}</td>
                            <td className="px-6 py-4 font-bold text-slate-950">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-lg text-sm ${isLow ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-[#078a72]'}`}><FaCapsules /></div>
                                <span>{tableName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4"><span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">{master.categoryClass || master.category || "Unassigned"}</span></td>
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