import React, { useState, useEffect, useRef } from "react";

// Component Imports
import Sidebar from "../patient/Sidebar";
import Navbar from "../patient/Navbar";
import HealthCard from "../patient/HealthCard";
import PersonalInfo from "../patient/PersonalInfo";
import MedicalHistory from "../patient/MedicalHistory";
import PrescriptionCard from "../patient/PrescriptionCard";
import EmergencyContact from "../patient/EmergencyContact";
import MedicalHistoryPopup from "../patient/MedicalHistoryPopup";
import PrescriptionPopup from "../patient/PrescriptionPopup";

// Automatically cleans any trailing slash or accidental double /api routes
const rawUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://medical-system-5fwx.onrender.com";

const CLEAN_BASE_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
const API_BASE_URL = `${CLEAN_BASE_URL}/api`;

export default function Dashboard({ onLogout }) {
  // User & Medical Data States
  const [user, setUser] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [emergencyContact, setEmergencyContact] = useState(null);

  // UI Status States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Layout & Navigation States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Popup / Modal States
  const [medicalHistoryOpen, setMedicalHistoryOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  // Layout Refs
  const mainRef = useRef(null);
  const emergencyRef = useRef(null);

  // Logout Handler
  const handleLogoutAction = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    if (typeof onLogout === "function") {
      onLogout();
    } else {
      window.location.href = "/login";
    }
  };

  // Fetch Patient Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          throw new Error("No authorization token found. Please log in again.");
        }

        const response = await fetch(`${API_BASE_URL}/patient/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          throw new Error("Session expired or invalid authorization. Please log in again.");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              errorData.error ||
              `Server error: ${response.status}`
          );
        }

        const data = await response.json();

        // 1. Resolve raw patient and user objects across various backend payloads
        const rawProfile =
          data.patientProfile ||
          data.patient ||
          data.dashboardData ||
          data.data ||
          data;

        const userObj = data.user || rawProfile.user || rawProfile;

        // 2. Extract Medical History array safely
        let resolvedHistory =
          (Array.isArray(data.history) && data.history.length > 0 ? data.history : null) ||
          (Array.isArray(data.medicalHistory) && data.medicalHistory.length > 0 ? data.medicalHistory : null) ||
          (Array.isArray(rawProfile.history) && rawProfile.history.length > 0 ? rawProfile.history : null) ||
          (Array.isArray(rawProfile.medicalHistory) && rawProfile.medicalHistory.length > 0 ? rawProfile.medicalHistory : null) ||
          [];

        // 3. Extract Prescriptions array safely
        let resolvedPrescriptions =
          (Array.isArray(data.prescriptions) && data.prescriptions.length > 0 ? data.prescriptions : null) ||
          (Array.isArray(data.medications) && data.medications.length > 0 ? data.medications : null) ||
          (Array.isArray(rawProfile.prescriptions) && rawProfile.prescriptions.length > 0 ? rawProfile.prescriptions : null) ||
          (Array.isArray(rawProfile.medications) && rawProfile.medications.length > 0 ? rawProfile.medications : null) ||
          [];

        // 4. Extract Allergies array safely
        let resolvedAllergies =
          (Array.isArray(data.allergies) && data.allergies.length > 0 ? data.allergies : null) ||
          (Array.isArray(rawProfile.allergies) && rawProfile.allergies.length > 0 ? rawProfile.allergies : null) ||
          (Array.isArray(userObj.allergies) && userObj.allergies.length > 0 ? userObj.allergies : null) ||
          [];

        const patId = userObj.patientId || rawProfile.patientId || data.patientId;
        const patEmail = userObj.email || rawProfile.email || data.email;

        // 5. Direct DB sync fallback: If history/prescriptions came back empty, query /patients
        if (resolvedHistory.length === 0 || resolvedPrescriptions.length === 0 || resolvedAllergies.length === 0) {
          try {
            let patientDoc = null;
            if (patId) {
              const pRes = await fetch(`${API_BASE_URL}/patients/${encodeURIComponent(patId)}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (pRes.ok) {
                const pJson = await pRes.json();
                patientDoc = pJson.patient || pJson.data || pJson;
              }
            }

            if (!patientDoc) {
              const allRes = await fetch(`${API_BASE_URL}/patients`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (allRes.ok) {
                const allJson = await allRes.json();
                const allList = Array.isArray(allJson) ? allJson : allJson.data || allJson.patients || [];
                patientDoc = allList.find(
                  (p) =>
                    (patId && (p.patientId === patId || p._id === patId)) ||
                    (patEmail && p.email && p.email.toLowerCase() === patEmail.toLowerCase())
                );
              }
            }

            if (patientDoc) {
              if (resolvedHistory.length === 0 && Array.isArray(patientDoc.history)) {
                resolvedHistory = patientDoc.history;
              }
              if (resolvedPrescriptions.length === 0 && Array.isArray(patientDoc.prescriptions)) {
                resolvedPrescriptions = patientDoc.prescriptions;
              }
              if (resolvedAllergies.length === 0 && Array.isArray(patientDoc.allergies)) {
                resolvedAllergies = patientDoc.allergies;
              }
            }
          } catch (syncErr) {
            console.warn("Direct patient sync skipped:", syncErr);
          }
        }

        // Map User Profile Details & attach allergies for PersonalInfo card
        const formattedUser = {
          name: userObj.fullName || userObj.name || rawProfile.fullName || "Patient",
          fullName: userObj.fullName || userObj.name || rawProfile.fullName || "Patient",
          patientId: patId || "PAT-348741",
          nic: userObj.nic || rawProfile.nic || "N/A",
          bloodGroup: userObj.bloodGroup || rawProfile.bloodGroup || "O+",
          dob: userObj.dob
            ? new Date(userObj.dob).toLocaleDateString()
            : rawProfile.dob
            ? new Date(rawProfile.dob).toLocaleDateString()
            : "4/18/2003",
          phone: userObj.phone || rawProfile.phone || "0754660204",
          email: patEmail || "kalharacharith69@gmail.com",
          address: userObj.address || rawProfile.address || "1450 Biscayne Blvd, Miami, FL 33132",
          gender: userObj.gender || rawProfile.gender || "Male",
          profileImage: userObj.profileImage || "",
          allergies: resolvedAllergies,
          knownAllergies: resolvedAllergies,
        };

        const formattedEmergencyContact = data.emergencyContact || rawProfile.emergencyContact || {
          name: rawProfile.guardianName || "Guardian",
          relationship: "Guardian",
          phone: rawProfile.guardianPhone || "0754660204",
        };

        // Update Component States
        setUser(formattedUser);
        setMedicalHistory(resolvedHistory);
        setPrescriptions(resolvedPrescriptions);
        setAllergies(resolvedAllergies);
        setSurgeries(rawProfile.surgeries || data.surgeries || []);
        setVaccinations(rawProfile.vaccinations || data.vaccinations || []);
        setEmergencyContact(formattedEmergencyContact);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle Menu Options
  const handleMenuClick = (menu) => {
    setActiveTab(menu);
    if (menu === "Dashboard" || menu === "Health Card") {
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (menu === "Medical History") {
      setMedicalHistoryOpen(true);
    }
    if (menu === "Prescriptions") {
      setPrescriptionOpen(true);
    }
    if (menu === "Emergency") {
      emergencyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1E5FAD] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm font-medium">Loading patient data...</p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F7FA] p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
            !
          </div>
          <p className="text-gray-900 font-semibold mb-2">Dashboard Authorization Error</p>
          <p className="text-gray-500 text-xs mb-4 leading-relaxed">{error}</p>
          <button
            onClick={handleLogoutAction}
            className="w-full py-2.5 bg-[#1E5FAD] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Main Dashboard Interface
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMenuClick={handleMenuClick}
        onLogout={handleLogoutAction}
      />

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 xl:ml-64 p-3 sm:p-4 md:p-6 overflow-y-auto h-screen">
        <Navbar user={user} setSidebarOpen={setSidebarOpen} />

        {/* Health Card & Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HealthCard user={user} />
          <PersonalInfo user={user} />
        </div>

        {/* Diagnosis / Medical History & Active Prescriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <MedicalHistory
            medicalHistory={medicalHistory}
            history={medicalHistory}
            onViewAll={() => {
              setActiveTab("Medical History");
              setMedicalHistoryOpen(true);
            }}
          />
          <PrescriptionCard
            prescriptions={prescriptions}
            medications={prescriptions}
            onViewAll={() => {
              setActiveTab("Prescriptions");
              setPrescriptionOpen(true);
            }}
          />
        </div>

        {/* Emergency Contact */}
        <div ref={emergencyRef} className="mt-6 mb-8">
          <EmergencyContact emergencyContact={emergencyContact} />
        </div>
      </main>

      {/* Medical History Modal */}
      {medicalHistoryOpen && (
        <MedicalHistoryPopup
          open={medicalHistoryOpen}
          onClose={() => {
            setMedicalHistoryOpen(false);
            setActiveTab("Dashboard");
          }}
          patient={{
            ...user,
            history: medicalHistory,
            medicalHistory: medicalHistory,
            surgeries: surgeries,
            allergies: allergies,
            vaccinations: vaccinations,
          }}
          user={user}
          medicalHistory={medicalHistory}
          surgeries={surgeries}
          allergies={allergies}
          vaccinations={vaccinations}
        />
      )}

      {/* Prescriptions Modal */}
      {prescriptionOpen && (
        <PrescriptionPopup
          open={prescriptionOpen}
          onClose={() => {
            setPrescriptionOpen(false);
            setActiveTab("Dashboard");
          }}
          patient={{
            ...user,
            prescriptions: prescriptions,
            medications: prescriptions,
          }}
          user={user}
          prescriptions={prescriptions}
        />
      )}
    </div>
  );
}