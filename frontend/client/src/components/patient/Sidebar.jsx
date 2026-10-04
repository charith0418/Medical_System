import React from "react";
import {
  FaPlusSquare,
  FaHome,
  FaIdCard,
  FaHistory,
  FaFileMedical,
  FaAmbulance,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

// Navigation Items
const menuItems = [
  { name: "Dashboard", icon: <FaHome /> },
  { name: "Health Card", icon: <FaIdCard /> },
  { name: "Medical History", icon: <FaHistory /> },
  { name: "Prescriptions", icon: <FaFileMedical /> },
  { name: "Emergency", icon: <FaAmbulance /> },
];

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  onMenuClick,
  onLogout,
}) {
  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 xl:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          w-64 h-screen
          bg-[#1E5FAD]
          text-white
          flex flex-col
          shadow-2xl
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          xl:translate-x-0
        `}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FaPlusSquare className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide leading-none">Smart</h1>
              <p className="text-blue-200 text-xs mt-1.5 tracking-wider uppercase font-medium">
                Health Card
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="xl:hidden text-white/80 hover:text-white text-lg p-1 cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation Options */}
        <nav className="flex-1 mt-4 px-3 overflow-y-auto space-y-1">
          {menuItems.map((item, index) => {
            const isTabActive = activeTab === item.name;
            return (
              <button
                key={index}
                onClick={() => {
                  onMenuClick(item.name);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                  isTabActive
                    ? "bg-white text-[#1E5FAD] font-semibold shadow-md"
                    : "hover:bg-white/10 text-blue-50"
                }`}
              >
                <span className={`text-lg ${isTabActive ? "text-[#1E5FAD]" : "opacity-80"}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </button>
            );
          })}

          {/* Logout Action */}
          <button
            onClick={() => {
              if (onLogout) onLogout();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm text-red-200 hover:bg-red-600/20 transition-all mt-6 border-t border-white/15 pt-4 cursor-pointer font-medium"
          >
            <span className="text-lg opacity-90">
              <FaSignOutAlt />
            </span>
            <span>Logout</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center text-[10px] text-blue-200/50 font-mono tracking-tight shrink-0">
          Smart Health Profile v1.0
        </div>
      </aside>
    </>
  );
}