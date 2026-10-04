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

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authorization token found. Please log in again.");
        }

        const response = await fetch(`${API_BASE_URL}/api/patient/dashboard`, {
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
          throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        const rawProfile = data.dashboardData || data;

        // Map User Profile Details
        const formattedUser = rawProfile.user || {
          name: rawProfile.fullName || rawProfile.name || "Patient",
          patientId: rawProfile.patientId || rawProfile._id || "N/A",
          bloodGroup: rawProfile.bloodGroup || "N/A",
          dob: rawProfile.dob ? new Date(rawProfile.dob).toLocaleDateString() : "N/A",
          phone: rawProfile.phone || "N/A",
          email: rawProfile.email || "N/A",
          address: rawProfile.address || "N/A",
          gender: rawProfile.gender || "N/A",
          profileImage: rawProfile.profileImage || "",
        };

        // Map Emergency Contact Details
        const formattedEmergencyContact = rawProfile.emergencyContact || {
          name: rawProfile.guardianName || "N/A",
          relationship: "Guardian",
          phone: rawProfile.guardianPhone || "N/A",
        };

        // Update Component States
        setUser(formattedUser);
        setMedicalHistory(rawProfile.medicalHistory || rawProfile.history || []);
        setSurgeries(rawProfile.surgeries || []);
        setAllergies(rawProfile.allergies || []);
        setVaccinations(rawProfile.vaccinations || []);
        setPrescriptions(rawProfile.prescriptions || []);
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
            onViewAll={() => {
              setActiveTab("Medical History");
              setMedicalHistoryOpen(true);
            }}
          />
          <PrescriptionCard
            prescriptions={prescriptions}
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
      <MedicalHistoryPopup
        open={medicalHistoryOpen}
        onClose={() => {
          setMedicalHistoryOpen(false);
          setActiveTab("Dashboard");
        }}
        user={user}
        medicalHistory={medicalHistory}
        surgeries={surgeries}
        allergies={allergies}
        vaccinations={vaccinations}
      />

      {/* Prescriptions Modal */}
      <PrescriptionPopup
        open={prescriptionOpen}
        onClose={() => {
          setPrescriptionOpen(false);
          setActiveTab("Dashboard");
        }}
        user={user}
        prescriptions={prescriptions}
      />
    </div>
  );
}