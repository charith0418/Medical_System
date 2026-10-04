import React, { useState, useEffect } from "react";
import {
  Search,
  QrCode,
  FileText,
  Pill,
  X,
  Stethoscope,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Plus,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import DoctorNavbar from "./DoctorNavbar";
import DoctorSidebar from "./DoctorSidebar";
import MedicalHistory from "./MedicalHistory";
import MedicalHistoryPopup from "./MedicalHistoryPopup";
import PrescriptionCard from "./PrescriptionCard";
import PrescriptionPopup from "./PrescriptionPopup";

const API_BASE_URL = "http://localhost:5000/api";

const standardDosages = [
  "1 Tablet Daily (QD)",
  "1 Tablet Twice Daily (BID)",
  "1 Tablet Three Times Daily (TID)",
  "Take as Needed (PRN)",
];

const standardDurations = ["3 Days", "5 Days", "7 Days", "14 Days", "30 Days"];

const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export default function DoctorDashboard({ onLogout }) {
  const [currentDoctor] = useState({
    id: 101,
    name: "Dr. N. Silva",
    specialty: "Cardiologist",
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchId, setSearchId] = useState("");
  const [activePatient, setActivePatient] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Popups
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showMedicalHistoryPopup, setShowMedicalHistoryPopup] = useState(false);
  const [showRxPopup, setShowRxPopup] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Patient Visit Form States
  const [diagnosedCondition, setDiagnosedCondition] = useState("");
  const [newAllergies, setNewAllergies] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");

  // Formulary & Prescription List
  const [hospitalFormulary, setHospitalFormulary] = useState([]);
  const [drugSearch, setDrugSearch] = useState("");
  const [selectedDrug, setSelectedDrug] = useState("");
  const [selectedDosage, setSelectedDosage] = useState(standardDosages[0]);
  const [selectedDuration, setSelectedDuration] = useState(standardDurations[0]);
  const [currentPrescriptionList, setCurrentPrescriptionList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch Medicine Stock from 'medicines' endpoint
  useEffect(() => {
    let isMounted = true;

    const fetchMedicinesStock = async () => {
      try {
        console.log(`Fetching active inventory from: ${API_BASE_URL}/medicines`);
        const response = await fetch(`${API_BASE_URL}/medicines`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Medicines inventory loaded from server:", data);

          const stockItems = Array.isArray(data) ? data : data.data || [];

          if (Array.isArray(stockItems) && stockItems.length > 0) {
            // Extract medicine names from populated medicineMasterId or direct properties
            const extractedNames = stockItems
              .map((item) => {
                if (!item) return "";
                if (typeof item === "string") return item;
                
                // Populated master document inside medicines collection
                if (item.medicineMasterId && typeof item.medicineMasterId === "object") {
                  return (
                    item.medicineMasterId.medicineName ||
                    item.medicineMasterId.name ||
                    item.medicineMasterId.title ||
                    ""
                  );
                }
                
                // Direct fallback properties
                return item.medicineName || item.name || item.title || "";
              })
              .filter((name) => Boolean(name && typeof name === "string"));

            // Remove duplicates
            const uniqueMedicines = [...new Set(extractedNames)];

            if (isMounted && uniqueMedicines.length > 0) {
              setHospitalFormulary(uniqueMedicines);
              console.log(`Synced ${uniqueMedicines.length} unique medicines successfully.`);
            }
          }
        }
      } catch (err) {
        console.error("Failed fetching medicines stock:", err);
      }
    };

    fetchMedicinesStock();
    return () => {
      isMounted = false;
    };
  }, []);

  const query = (drugSearch || "").trim().toLowerCase();
  const filteredDrugs = query
    ? hospitalFormulary.filter((d) => d.toLowerCase().includes(query))
    : hospitalFormulary;

  const handlePatientSearch = async (e, directId = null) => {
    if (e) e.preventDefault();
    const idToLookup = (directId || searchId || "").trim();
    if (!idToLookup) return;

    setIsLoading(true);
    setSearchError("");

    try {
      const response = await fetch(`${API_BASE_URL}/patients/${idToLookup}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired or invalid token. Please log in again.");
        }
        if (response.status === 404) {
          throw new Error(`Patient profile matching "${idToLookup}" could not be found.`);
        }
        throw new Error("Failed to fetch patient data from server.");
      }

      const patientData = await response.json();
      setActivePatient(patientData.data || patientData);
    } catch (error) {
      setActivePatient(null);
      setSearchError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startCameraScanner = async () => {
    setScannerError("");
    setShowScanner(true);

    setTimeout(async () => {
      try {
        const scannerElement = document.getElementById("wristband-reader");
        if (!scannerElement) {
          setScannerError("Scanner could not be initialized. Please try again.");
          return;
        }

        const scanner = new Html5Qrcode("wristband-reader");
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          async (decodedText) => {
            try {
              await scanner.stop();
              await scanner.clear();
            } catch (cleanupError) {
              console.warn("Scanner cleanup error:", cleanupError);
            }
            setShowScanner(false);
            setSearchId(decodedText);
            handlePatientSearch(null, decodedText);
          },
          () => {}
        );
      } catch (error) {
        console.error("Camera scanner error:", error);
        setScannerError(
          "Could not access the camera. Please allow camera permission and try again."
        );
      }
    }, 150);
  };

  const closeCameraScanner = async () => {
    try {
      const scannerElement = document.getElementById("wristband-reader");
      if (scannerElement) {
        const videos = scannerElement.querySelectorAll("video");
        videos.forEach((video) => {
          if (video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          }
        });
      }
    } catch (error) {
      console.warn("Camera cleanup error:", error);
    }
    setShowScanner(false);
    setScannerError("");
  };

  const clearActivePatient = () => {
    setActivePatient(null);
    setSearchId("");
    setDiagnosedCondition("");
    setNewAllergies("");
    setTreatmentNotes("");
    setCurrentPrescriptionList([]);
  };

  const addDrugToPrescription = () => {
    const drugToAdd = selectedDrug || drugSearch;
    if (!drugToAdd) return;

    setCurrentPrescriptionList([
      ...currentPrescriptionList,
      {
        medicineName: drugToAdd,
        drug: drugToAdd,
        dosage: selectedDosage,
        duration: selectedDuration,
      },
    ]);

    setDrugSearch("");
    setSelectedDrug("");
    setShowDropdown(false);
  };

  const removeDrugFromPrescription = (indexToRemove) => {
    setCurrentPrescriptionList(
      currentPrescriptionList.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const handleSaveVisit = async () => {
    if (!activePatient) return;
    setIsLoading(true);

    const formattedMedicines = currentPrescriptionList.map((med) => ({
      medicineName: med.medicineName || med.drug,
      dosage: med.dosage,
      duration: med.duration,
    }));

    const visitPayload = {
      patientId: activePatient.patientId || activePatient._id,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      clinic: "General Consultation",
      hospitalName: "Medicare Hospital",
      date: new Date().toISOString().split("T")[0],
      diagnosis: diagnosedCondition,
      notes: treatmentNotes,
      reportedAllergies: newAllergies,
      prescriptions: formattedMedicines,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/visitations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(visitPayload),
      });

      const result = await response.json();
      if (response.ok && (result.success || result._id || result.id)) {
        alert(
          `Successfully recorded visit for ${
            activePatient.fullName || activePatient.name
          }!`
        );

        if (result.updatedPatient) {
          setActivePatient(result.updatedPatient);
        } else {
          handlePatientSearch(null, activePatient.patientId || activePatient._id);
        }

        setDiagnosedCondition("");
        setNewAllergies("");
        setTreatmentNotes("");
        setCurrentPrescriptionList([]);
      } else {
        alert(`Failed to save visit record: ${result.message || "Server error"}`);
      }
    } catch (error) {
      console.error("Database error:", error);
      alert("Network Error: Could not reach the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderDoctorContent = () => {
    switch (activeTab) {
      case "history":
        return <MedicalHistory patient={activePatient} />;
      case "dashboard":
      default:
        return (
          <div className="space-y-8 w-full animate-fadeIn">
            {!activePatient && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch w-full">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Find Patient File
                  </h3>
                  <form
                    onSubmit={(e) => handlePatientSearch(e)}
                    className="flex gap-4"
                  >
                    <div className="flex bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden focus-within:border-emerald-600 focus-within:bg-white transition-all flex-1">
                      <input
                        type="text"
                        placeholder="Enter Patient ID (e.g. PAT-582194) or NIC..."
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full bg-transparent px-6 py-4 outline-none text-lg font-medium placeholder-slate-400 text-slate-900"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-8 rounded-xl text-sm font-bold tracking-wider uppercase shadow-sm flex items-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Search size={18} />
                      {isLoading ? "Searching..." : "Open Profile"}
                    </button>
                  </form>
                  {searchError && (
                    <p className="text-rose-600 font-medium text-sm mt-4 ml-2">
                      ⚠️ {searchError}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <div
                    onClick={startCameraScanner}
                    className="bg-white border-2 border-dashed border-emerald-600/60 bg-emerald-50/5 p-8 rounded-2xl text-center h-full flex flex-col justify-center items-center group cursor-pointer hover:bg-emerald-50/10 transition-all"
                  >
                    <h3 className="text-slate-800 font-bold mb-3 text-lg tracking-wide uppercase">
                      Scan Wristband
                    </h3>
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                      <QrCode size={32} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 mt-5 uppercase tracking-widest">
                      Turn on camera scanner
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activePatient && (
              <div className="space-y-8 w-full animate-fadeIn">
                <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-emerald-600 font-bold text-2xl flex items-center justify-center border border-white/10 uppercase text-white shrink-0">
                      {(
                        activePatient.fullName ||
                        activePatient.name ||
                        "P"
                      ).charAt(0)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h2 className="text-2xl font-bold tracking-tight text-white truncate">
                        {activePatient.fullName ||
                          activePatient.name ||
                          "Patient Profile"}
                      </h2>
                      <div className="text-xs text-slate-300 font-medium flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                          ID: {activePatient.patientId || activePatient._id || "N/A"}
                        </span>
                        <span>
                          • Age: {activePatient.age || calculateAge(activePatient.dob)} Yrs
                        </span>
                        <span>• Gender: {activePatient.gender || "N/A"}</span>
                        <span>
                          • Blood Type:{" "}
                          <strong className="text-rose-400 font-bold">
                            {activePatient.bloodGroup || "N/A"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0 border-t border-slate-700 lg:border-t-0 pt-4 lg:pt-0">
                    <button
                      onClick={() => setShowMedicalHistoryPopup(true)}
                      className="flex-1 sm:flex-none px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs flex items-center justify-center gap-2 font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                    >
                      <FileText size={16} /> Medical Archive
                    </button>
                    <button
                      onClick={() => setShowRxPopup(true)}
                      className="flex-1 sm:flex-none px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs flex items-center justify-center gap-2 font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                    >
                      <Pill size={16} /> Medication Logs
                    </button>
                    <button
                      onClick={clearActivePatient}
                      className="px-4 py-3 bg-white/5 text-slate-300 hover:text-white hover:bg-rose-600 rounded-xl text-xs flex items-center justify-center gap-2 font-bold uppercase tracking-wider border border-white/10 transition cursor-pointer"
                    >
                      <X size={16} /> Close File
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start w-full">
                  <div className="xl:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Diagnosis Box */}
                      <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl shrink-0">
                            <Stethoscope size={28} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
                              Add Diagnosis & Visit Notes
                            </h4>
                            <p className="text-sm text-slate-400 font-medium mt-1 leading-relaxed">
                              Log current symptoms, illnesses, checkups, or treatment notes for today's visit.
                            </p>
                          </div>
                        </div>
                        {diagnosedCondition && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800">
                            <span className="text-slate-400 uppercase tracking-widest block text-[10px] font-bold mb-1">
                              Staged Diagnosis
                            </span>
                            {diagnosedCondition}
                          </div>
                        )}
                        <button
                          onClick={() => setShowTreatmentModal(true)}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                          Open Form
                        </button>
                      </div>

                      {/* Prescription Box */}
                      <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="p-4 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl shrink-0">
                            <Pill size={28} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
                              Write New Prescription
                            </h4>
                            <p className="text-sm text-slate-400 font-medium mt-1 leading-relaxed">
                              Search the active medicines stock list to add items, doses, and directions.
                            </p>
                          </div>
                        </div>
                        {currentPrescriptionList.length > 0 && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800">
                            <span className="text-slate-400 uppercase tracking-widest block text-[10px] font-bold mb-1">
                              Selected Medicines
                            </span>
                            {currentPrescriptionList.length} Items Selected
                          </div>
                        )}
                        <button
                          onClick={() => setShowPrescriptionModal(true)}
                          className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                          Open Form
                        </button>
                      </div>
                    </div>

                    {/* Prescriptions History */}
                    {Array.isArray(activePatient.prescriptions) &&
                      activePatient.prescriptions.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Recent Patient Prescriptions
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activePatient.prescriptions.map((rx, idx) => (
                              <PrescriptionCard
                                key={rx._id || idx}
                                prescription={rx}
                                onClick={() => setSelectedPrescription(rx)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Save Button */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <button
                        onClick={handleSaveVisit}
                        disabled={
                          isLoading ||
                          (!diagnosedCondition.trim() &&
                            currentPrescriptionList.length === 0 &&
                            !newAllergies.trim() &&
                            !treatmentNotes.trim())
                        }
                        className="w-full py-4 bg-slate-800 text-white rounded-xl text-base font-bold tracking-wider uppercase flex items-center justify-center gap-3 hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <CheckCircle size={20} />
                        {isLoading
                          ? "Saving to Database..."
                          : "Save & Finish Patient Visit"}
                      </button>
                    </div>
                  </div>

                  {/* Right Sidebar Info */}
                  <div className="space-y-8 w-full">
                    <div className="bg-rose-50/40 border border-rose-200 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-rose-200 pb-3 text-rose-800">
                        <AlertTriangle size={18} />
                        <h4 className="text-xs font-bold uppercase tracking-widest">
                          Known Allergies
                        </h4>
                      </div>
                      {Array.isArray(activePatient.allergies) &&
                      activePatient.allergies.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {activePatient.allergies.map((allergy, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-rose-100 text-rose-700 font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              {typeof allergy === "string"
                                ? allergy
                                : allergy?.name || "Unspecified"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-slate-400 italic">
                          No allergies recorded.
                        </p>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Clock className="text-slate-400" size={18} />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                          Past History Quick View
                        </h4>
                      </div>
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {Array.isArray(activePatient.history) &&
                        activePatient.history.length > 0 ? (
                          activePatient.history.map((h, i) => (
                            <div
                              key={h._id || i}
                              className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs transition-all hover:bg-white hover:border-slate-300"
                            >
                              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                <span>📅 {h.date || "N/A"}</span>
                                <span className="text-emerald-700 uppercase">
                                  {h.doctor || h.doctorName || "General Doctor"}
                                </span>
                              </div>
                              <h5 className="font-bold text-slate-800 text-sm tracking-tight">
                                {h.diagnosis || "Unspecified"}
                              </h5>
                              <p className="text-slate-600 leading-relaxed font-medium">
                                {h.notes || "No notes available."}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            No previous visit history logged.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Treatment Modal */}
            {showTreatmentModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="text-emerald-600" size={22} />
                      <h3 className="text-lg font-bold text-slate-800 uppercase">
                        Diagnosis & Treatment Notes
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowTreatmentModal(false)}
                      className="text-slate-400 hover:bg-slate-200 p-2 rounded-xl transition cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-8 space-y-6 flex-1 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Diagnosis / Illness Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Asthma, Hypertension"
                          value={diagnosedCondition}
                          onChange={(e) => setDiagnosedCondition(e.target.value)}
                          className="w-full bg-slate-50 rounded-xl border-2 border-slate-200 px-4 py-3 font-medium text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">
                          Add New Allergies (If Any)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Penicillin"
                          value={newAllergies}
                          onChange={(e) => setNewAllergies(e.target.value)}
                          className="w-full bg-rose-50/10 rounded-xl border-2 border-rose-200 focus:border-rose-500 px-4 py-3 text-rose-700 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Doctor Notes & Treatment Plan
                      </label>
                      <textarea
                        rows="5"
                        placeholder="Write any specific instructions, advice, or observation details here..."
                        value={treatmentNotes}
                        onChange={(e) => setTreatmentNotes(e.target.value)}
                        className="w-full bg-slate-50 rounded-xl border-2 border-slate-200 px-4 py-3 font-medium text-slate-800 focus:bg-white focus:border-emerald-600 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-between items-center">
                    <button
                      onClick={() => setShowTreatmentModal(false)}
                      className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-300 transition cursor-pointer"
                    >
                      Close Modal
                    </button>
                    <button
                      onClick={async () => {
                        setShowTreatmentModal(false);
                        await handleSaveVisit();
                      }}
                      disabled={isLoading || !diagnosedCondition.trim()}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      {isLoading ? "Saving..." : "Save Directly to Database"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Prescription Modal */}
            {showPrescriptionModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-visible border border-slate-200 flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <Pill className="text-emerald-600" size={22} />
                      <h3 className="text-lg font-bold text-slate-800 uppercase">
                        Write New Prescription
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowPrescriptionModal(false)}
                      className="text-slate-400 hover:bg-slate-200 p-2 rounded-xl transition cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-8 space-y-6 flex-1 w-full">
                    {/* Medicine Auto-complete Search */}
                    <div className="relative w-full z-40">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Search Medicines Inventory
                        </label>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {hospitalFormulary.length} Stock Medicines Synced
                        </span>
                      </div>

                      <div className="flex bg-slate-50 rounded-xl border-2 border-slate-200 items-center px-4 focus-within:border-emerald-600 focus-within:bg-white transition-all">
                        <Pill className="text-slate-400" size={20} />
                        <input
                          type="text"
                          placeholder="Type medicine name..."
                          value={drugSearch}
                          onFocus={() => setShowDropdown(true)}
                          onClick={() => setShowDropdown(true)}
                          onChange={(e) => {
                            setDrugSearch(e.target.value);
                            setSelectedDrug(e.target.value);
                            setShowDropdown(true);
                          }}
                          className="w-full px-4 py-3.5 text-base font-medium outline-none text-slate-900 bg-transparent"
                        />
                        {drugSearch && (
                          <button
                            onClick={() => {
                              setDrugSearch("");
                              setSelectedDrug("");
                            }}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Suggestions List */}
                      {showDropdown && filteredDrugs.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-emerald-500 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-[100] divide-y divide-slate-100">
                          {filteredDrugs.map((drugName, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedDrug(drugName);
                                setDrugSearch(drugName);
                                setShowDropdown(false);
                              }}
                              className="px-5 py-3 hover:bg-emerald-50 cursor-pointer text-slate-800 font-semibold text-sm transition-colors flex items-center justify-between"
                            >
                              <span>{drugName}</span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-bold uppercase">
                                In Stock
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {showDropdown && filteredDrugs.length === 0 && drugSearch.trim() !== "" && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center text-slate-400 text-sm font-medium z-[100]">
                          No medicine matches "{drugSearch}" in current inventory.
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Dosage Frequency
                        </label>
                        <select
                          value={selectedDosage}
                          onChange={(e) => setSelectedDosage(e.target.value)}
                          className="w-full bg-slate-50 rounded-xl border-2 border-slate-200 px-4 py-3 font-medium text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                        >
                          {standardDosages.map((dos, idx) => (
                            <option key={idx} value={dos}>
                              {dos}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Duration
                        </label>
                        <select
                          value={selectedDuration}
                          onChange={(e) => setSelectedDuration(e.target.value)}
                          className="w-full bg-slate-50 rounded-xl border-2 border-slate-200 px-4 py-3 font-medium text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                        >
                          {standardDurations.map((dur, idx) => (
                            <option key={idx} value={dur}>
                              {dur}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addDrugToPrescription}
                      disabled={!selectedDrug && !drugSearch}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Plus size={16} /> Add Medicine to List
                    </button>

                    {currentPrescriptionList.length > 0 && (
                      <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-800">
                          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="p-3">Medicine</th>
                              <th className="p-3">Dosage</th>
                              <th className="p-3">Duration</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentPrescriptionList.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold">
                                  {item.medicineName || item.drug}
                                </td>
                                <td className="p-3 text-slate-600">
                                  {item.dosage}
                                </td>
                                <td className="p-3 text-slate-600">
                                  {item.duration}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() =>
                                      removeDrugFromPrescription(idx)
                                    }
                                    className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition cursor-pointer"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button
                      onClick={() => setShowPrescriptionModal(false)}
                      className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:bg-slate-900 cursor-pointer"
                    >
                      Save Prescription List
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Scanner Overlay */}
            {showScanner && (
              <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                      <QrCode className="text-emerald-600" size={22} />
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 uppercase">
                          Scan Patient Wristband
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Position the QR code inside the frame
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeCameraScanner}
                      className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 p-2 rounded-xl transition cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6">
                    <div
                      id="wristband-reader"
                      className="w-full overflow-hidden rounded-2xl border-2 border-emerald-200 bg-black min-h-[300px]"
                    />
                    {scannerError && (
                      <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm font-medium">
                        {scannerError}
                      </div>
                    )}
                  </div>

                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                      onClick={closeCameraScanner}
                      className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-900 transition cursor-pointer"
                    >
                      Cancel Scanner
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      <DoctorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DoctorNavbar doctor={currentDoctor} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-8">
          {renderDoctorContent()}
        </main>
      </div>

      {showMedicalHistoryPopup && activePatient && (
        <MedicalHistoryPopup
          patient={activePatient}
          onClose={() => setShowMedicalHistoryPopup(false)}
        />
      )}

      {showRxPopup && activePatient && (
        <PrescriptionPopup
          patient={activePatient}
          onClose={() => setShowRxPopup(false)}
        />
      )}

      {selectedPrescription && (
        <PrescriptionPopup
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </div>
  );
}