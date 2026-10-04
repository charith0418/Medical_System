import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaExclamationTriangle, FaPlusSquare, FaPhoneAlt, FaPrint } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function PrintCard() {
  const [patientId, setPatientId] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Suggestion list states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const cardSectionRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Queries the backend API live as the user types
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setPatientId(value);

    if (value.trim().length > 0) {
      try {
        const token = localStorage.getItem("token");
        // Fetches all patients or searches with query parameters depending on your API setup
        const response = await fetch(`${API_BASE_URL}/patients`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Filter dynamically based on search inputs
          const filtered = data.filter(
            (p) =>
              (p.patientId && p.patientId.toLowerCase().includes(value.toLowerCase())) ||
              (p.fullName && p.fullName.toLowerCase().includes(value.toLowerCase())) ||
              (p.nic && p.nic.toLowerCase().includes(value.toLowerCase()))
          );
          setSuggestions(filtered);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Live lookup fetch failed:", err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Close the suggestion box if user clicks outside of the search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When user clicks a suggestion from the popup list
  const selectSuggestion = (patient) => {
    setPatientId(patient.patientId || patient._id);
    setSuggestions([]);
    setShowSuggestions(false);
    loadPatientCard(patient.patientId || patient._id);
  };

  // Core fetch and load logic from Mongoose backend
  const loadPatientCard = async (idToFetch) => {
    if (!idToFetch) return;
    setLoading(true);
    setError("");
    setPatientData(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/patients/${idToFetch}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Patient record "${idToFetch}" could not be found in the database.`);
      }

      const data = await response.json();
      
      // Clean up backend model attributes into predictable state fields
      setPatientData({
        patientId: data.patientId || data._id.substring(18).toUpperCase(),
        fullName: data.fullName || "Registered Patient",
        dob: data.dob ? data.dob.split("T")[0] : "N/A",
        bloodGroup: data.bloodGroup || "--",
        phone: data.phone || "N/A"
      });
      
      setTimeout(() => {
        cardSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    } catch (err) {
      console.error("Error fetching card details:", err);
      setError(err.message || "Failed to load the health card from server registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    loadPatientCard(patientId);
  };

  // Browser Print trigger
  const handlePrint = () => {
    window.print();
  };

  const qrCodeUrl = patientData 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=14427D&data=${patientData.patientId}` 
    : "";

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 text-slate-800">
      
      {/* 🔍 SEARCH LOOKUP BAR & POPUP LIST (Hidden during printing) */}
      <div ref={searchContainerRef} className="relative max-w-2xl mx-auto print:hidden">
        <form 
          onSubmit={handleFormSubmit} 
          className="flex gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs"
        >
          <div className="flex bg-slate-50 rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#078a72] transition-all flex-1">
            <input
              type="text"
              placeholder="Search by ID or Full Identity Name..."
              value={patientId}
              onChange={handleInputChange}
              onFocus={() => patientId && setShowSuggestions(true)}
              className="w-full bg-transparent px-5 py-3 outline-hidden text-base text-slate-950 font-medium"
              required
            />
          </div>
          <button 
            type="submit" 
            className="px-6 py-3 bg-[#078a72] hover:bg-[#056b58] text-white font-bold text-sm rounded-xl transition flex items-center justify-center min-w-[130px] cursor-pointer"
          >
            {loading ? "Loading..." : (
              <span className="flex items-center gap-2"><FaSearch /> Load Card</span>
            )}
          </button>
        </form>

        {/* 📋 POPUP SUGGESTIONS DROPDOWN */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
            {suggestions.map((patient) => (
              <div
                key={patient.patientId || patient._id}
                onClick={() => selectSuggestion(patient)}
                className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors text-left"
              >
                <div>
                  <p className="font-bold text-slate-900">{patient.fullName || "Registered Patient"}</p>
                  <p className="text-[13px] text-slate-400">
                    DOB: {patient.dob ? patient.dob.split("T")[0] : "N/A"} | Nic: {patient.nic || "N/A"}
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-[#078a72] bg-emerald-50 px-2.5 py-1 rounded-md">
                  {patient.patientId || patient._id.substring(18).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ⚠️ ERROR BANNER */}
      {error && (
        <div className="max-w-2xl mx-auto bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 animate-fadeIn print:hidden">
          <FaExclamationTriangle className="text-xl shrink-0 text-rose-500" />
          <span className="font-semibold text-sm">{error}</span>
        </div>
      )}

      {/* 🪪 HEALTHCARD CONTAINER */}
      {patientData && (
        <div 
          ref={cardSectionRef} 
          className="max-w-xl mx-auto p-6 bg-white rounded-2xl border border-slate-100 shadow-sm w-full h-full flex flex-col justify-between animate-fadeIn print:p-0 print:border-none print:shadow-none"
        >
          
          {/* Centered Header Row (Hidden during printing) */}
          <div className="text-center mb-6 print:hidden">
            <h3 className="text-xl font-bold text-slate-800">Your Smart Health Card</h3>
            <p className="text-xs text-slate-400 mt-1">
              Print your official smart profile card directly to card-compatible hardware.
            </p>
          </div>

          {/* Visual Canvas Card Frame Container */}
          <div className="flex-1 py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center min-h-[250px] print:bg-transparent print:border-none print:p-0">
            
            {/* Capturable/Printable ID Card - Target Container */}
            <div 
              id="printable-health-card"
              className="w-[380px] h-[230px] bg-gradient-to-br from-[#1E5FAD] to-[#14427D] text-white rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden shrink-0 border border-blue-900"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

              {/* Top Banner Row */}
              <div className="flex justify-between items-start border-b border-white/20 pb-2.5 z-10">
                <div className="flex items-center gap-2">
                  <FaPlusSquare className="text-2xl text-emerald-300 shrink-0" />
                  <div className="text-left">
                    <h1 className="text-xs font-bold tracking-wide uppercase leading-none">Medicare Network</h1>
                    <p className="text-[8px] text-blue-200 tracking-wider uppercase font-medium mt-1">Smart Health Profile</p>
                  </div>
                </div>
                <span className="bg-red-500/20 text-red-200 border border-red-400/30 font-black text-[9px] px-2 py-0.5 rounded-md tracking-wider">
                  EMERGENCY
                </span>
              </div>

              {/* Dynamic Core Body Row */}
              <div className="flex flex-1 items-center justify-between gap-4 py-2 z-10">
                <div className="flex-1 space-y-2.5 text-left">
                  <div>
                    <p className="text-[8px] text-blue-200 uppercase font-bold tracking-wider">Patient Name</p>
                    <h2 className="text-sm font-black truncate max-w-[190px] tracking-tight text-white">
                      {patientData.fullName}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[8px] text-blue-200 uppercase font-bold tracking-wider">Patient ID</p>
                      <p className="text-xs font-mono font-bold tracking-wide">{patientData.patientId}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-blue-200 uppercase font-bold tracking-wider">Blood Type</p>
                      <p className="text-xs font-black text-emerald-300">{patientData.bloodGroup}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-1.5 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                  <img 
                    src={qrCodeUrl}
                    alt="Verification QR"
                    className="w-16 h-16 object-contain"
                    crossOrigin="anonymous" 
                  />
                </div>
              </div>

              {/* Bottom ICE bar Row */}
              <div className="border-t border-white/10 pt-2 flex items-center justify-between z-10 text-[9px]">
                <div className="flex items-center gap-1.5 text-blue-100">
                  <FaPhoneAlt className="text-[8px] text-emerald-300" />
                  <span className="font-medium opacity-80">ICE Contact:</span>
                  <span className="font-bold font-mono tracking-wide">
                    {patientData.phone}
                  </span>
                </div>
                <span className="text-[7px] font-mono opacity-35 tracking-tight">ISO CR-80 Secure Spec</span>
              </div>

            </div>
          </div>

          {/* 🖨️ Big Width Primary Print Action Button (Below Card) */}
          <div className="mt-6 flex justify-center print:hidden">
            <button
              onClick={handlePrint}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-base rounded-xl transition shadow-md flex items-center justify-center gap-3 cursor-pointer select-none"
            >
              <FaPrint className="text-lg" /> Print Smart Health Card
            </button>
          </div>

        </div>
      )}

      {/* CSS Isolation Rules for exact printing scales */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-health-card, #printable-health-card * {
            visibility: visible !important;
          }
          #printable-health-card {
            position: absolute !important;
            left: 50% !important;
            top: 40% !important;
            transform: translate(-50%, -50%) scale(1.3) !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}