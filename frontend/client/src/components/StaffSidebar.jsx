import React, { useState } from "react";
import Logo from "../assets/logo.png";

import { IoClose } from "react-icons/io5";
import { FaBars, FaPlusSquare, FaBoxes } from "react-icons/fa";
import { MdOutlineDashboardCustomize, MdLogout, MdLibraryBooks } from "react-icons/md";
import { FaHospitalUser } from "react-icons/fa";
import { BiQrScan } from "react-icons/bi";

import RegistrationPatient from "./RegistrationPatient";
import StaffDashboard from "../components/StaffDashboard";
import Patients from "../components/Patients";
import PrintCard from "./PrintCard";
import HospitalInventory from "./HospitalInventory"; 

const StaffSidebar = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // 1. Primary Patient & Desk Operations Tabs
  const primaryNavItems = [
    { name: "Dashboard", icon: <MdOutlineDashboardCustomize className="text-2xl" /> },
    { name: "Register Patient", icon: <FaHospitalUser className="text-2xl" /> },
    { name: "Patients", icon: <BiQrScan className="text-2xl" /> },
    { name: "Print Card", icon: <MdLibraryBooks className="text-2xl" /> },
  ];

  // 2. Separate Inventory / Management Tabs
  const managementNavItems = [
    { name: "Medicine Register", icon: <FaBoxes className="text-2xl" /> },
  ];

  return (
    <div className="flex bg-slate-100 h-screen w-full overflow-hidden text-slate-800 relative">
      
      {/* ==================== MOBILE BACKDROP OVERLAY ==================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==================== SIDEBAR COMPONENT ==================== */}
      <aside
        className={`fixed bg-[#078a72] w-72 h-screen shadow-xl transition-transform duration-300 z-50 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        <div>
          {/* Upper Branding Header Sector */}
          <div className="p-5 flex justify-between items-center border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <FaPlusSquare className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-white font-black text-lg tracking-wide leading-none">Smart</h1>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mt-1.5">Health Card</p>
              </div>
            </div>

            <button
              className="lg:hidden text-white text-3xl hover:text-slate-200 transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <IoClose />
            </button>
          </div>

          {/* Navigation Items Menu Layout */}
          <nav className="p-5 space-y-6">
            
            {/* CORE DESK OPERATIONAL SECTION */}
            <div className="space-y-2">
              {primaryNavItems.map((item) => {
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer select-none font-bold text-base text-left transition-all duration-200 ${
                      isActive
                        ? "bg-white text-[#078a72] shadow-md transform translate-x-1"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className={`transition-transform duration-200 ${isActive ? "scale-110 text-[#078a72]" : "text-white/80"}`}>
                      {item.icon}
                    </div>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* ==================== SEPARATED MANAGEMENT SECTION ==================== */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">
                Inventory Logistics
              </p>
              
              {managementNavItems.map((item) => {
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer select-none font-bold text-base text-left transition-all duration-200 ${
                      isActive
                        ? "bg-white text-[#078a72] shadow-md transform translate-x-1"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className={`transition-transform duration-200 ${isActive ? "scale-110 text-[#078a72]" : "text-white/80"}`}>
                      {item.icon}
                    </div>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* System Logout Action Layout Block */}
            <button
              onClick={() => {
                if (onLogout) onLogout();
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer select-none text-red-200 hover:bg-red-600/20 text-left font-bold text-base transition-all duration-200 pt-4 border-t border-white/10"
            >
              <MdLogout className="text-2xl text-white/80" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Bottom Small Application Branding Details Info Panel */}
        <div className="p-5 text-center text-[10px] text-white/30 font-mono tracking-tight shrink-0">
          Smart Health Profile v1.0
        </div>
      </aside>

      {/* ==================== MAIN APPLICATION FRAME AREA ==================== */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-2xl text-slate-700 hover:text-slate-900 transition-colors mr-1 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activeTab}</h1>
          </div>
          
          {/* Session Profile Ring avatar indication */}
          <div className="flex items-center gap-3 select-none">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800">Hospital Staff</p>
              <p className="text-xs font-semibold text-slate-400">Desk Operator</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-200 border border-slate-300 shadow-inner flex items-center justify-center font-bold text-slate-500 text-lg">
              OP
            </div>
          </div>
        </header>

        {/* Dynamic Inner Main Content Routing Frame View */}
        <main className="p-8 flex-1 bg-slate-50/50">
          {activeTab === "Dashboard" && <StaffDashboard />}
          {activeTab === "Register Patient" && <RegistrationPatient />}
          {activeTab === "Medicine Register" && <HospitalInventory />} 
          {activeTab === "Patients" && <Patients />}
          {activeTab === "Print Card" && <PrintCard />}
        </main>
      </div>

    </div>
  );
};

export default StaffSidebar;