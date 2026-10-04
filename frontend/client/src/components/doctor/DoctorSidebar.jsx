import React from "react";
import { FaThLarge, FaSignOutAlt, FaPlusSquare } from "react-icons/fa";

export default function DoctorSidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { name: "Dashboard", id: "dashboard", icon: <FaThLarge /> },
  ];

  const handleLogoutClick = () => {
    
    if (typeof onLogout === "function") {
      onLogout();
    } else {
      
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <aside className="sticky top-0 h-screen w-64 bg-[#00875A] text-white flex flex-col justify-between p-4 z-50 shrink-0">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="bg-white/20 p-2 rounded-xl text-white">
            <FaPlusSquare className="text-2xl" />
          </div>
          <h1 className="text-md font-bold tracking-wide">Medicare Hospital</h1>
        </div>

        {/* Main Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-[#005C3E] text-white font-semibold shadow-inner"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-lg opacity-90">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}

          {/* Spacer block */}
          <div className="h-12" />

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-white/85 hover:bg-rose-600/30 hover:text-white transition-all cursor-pointer text-left"
          >
            <span className="text-lg">
              <FaSignOutAlt />
            </span>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      <div />
    </aside>
  );
}