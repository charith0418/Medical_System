import React from "react";
import {
  FaChevronDown,
  FaUserCircle,
} from "react-icons/fa";

export default function AdminNavbar({ admin = {} }) {
  return (
    <header className="bg-white rounded-2xl shadow-sm px-6 py-4 flex justify-between items-center mb-6">

      {/* Left Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome,
          <span className="text-[#0B5ED7] ml-2">
            {admin.name || "Admin"}
          </span>
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your Smart Health Card System
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">

      

        {/* Divider */}
        <div className="w-px h-10 bg-gray-200"></div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 cursor-pointer">

          <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-gray-100 flex items-center justify-center overflow-hidden">
            {admin.image ? (
              <img
                src={admin.image}
                alt="Admin"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-gray-400" />
            )}
          </div>

          <div className="hidden md:block">

            <h3 className="font-semibold text-gray-800">
              {admin.name || "Admin"}
            </h3>

            <p className="text-xs text-gray-500">
              System Administrator
            </p>

          </div>

          <FaChevronDown className="text-gray-500" />

        </div>

      </div>

    </header>
  );
}