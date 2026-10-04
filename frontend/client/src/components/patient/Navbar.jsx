import React from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";

export default function Navbar({ user = {}, setSidebarOpen }) {
  // Extract patient ID or display default fallback
  const displayId = user?.patientId || user?._id || "N/A";

  return (
    <header className="bg-white rounded-2xl shadow-xs px-4 md:px-6 py-4 mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between border border-slate-100">
      {/* Left Greeting */}
      <div className="flex items-center justify-between md:justify-start gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="xl:hidden text-2xl text-slate-700 hover:text-[#1E5FAD] cursor-pointer"
        >
          <FaBars />
        </button>

        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Welcome,
            <span className="text-[#1E5FAD] ml-2">
              {user?.name || "Patient"}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Have a healthy day!
          </p>
        </div>
      </div>

      {/* Right User Profile Chip */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#1E5FAD] bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-gray-400" />
            )}
          </div>

          <div className="block">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base leading-tight">
              {user?.name || "Patient"}
            </h3>
            <p className="text-xs text-gray-500 font-mono">
              ID: {displayId}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}