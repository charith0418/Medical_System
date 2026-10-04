import React from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaVenusMars,
  FaBirthdayCake,
  FaIdCard,
  FaUser,
  FaShieldVirus,
} from "react-icons/fa";

export default function PersonalInfo({ user = {}, allergies = [] }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm w-full h-full flex flex-col">

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          Personal Information
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Patient basic details & health alerts
        </p>
      </div>

      {/* Information List */}
      <div className="space-y-5 flex-1">

        {/* Full Name */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <FaUser />
          </div>
          <div>
            <p className="text-xs text-gray-500">Full Name</p>
            <h4 className="font-semibold text-gray-800">
              {user.name || "Not Available"}
            </h4>
          </div>
        </div>

        {/* Patient ID */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-[#1E5FAD] flex items-center justify-center">
            <FaIdCard />
          </div>
          <div>
            <p className="text-xs text-gray-500">Patient ID</p>
            <h4 className="font-semibold text-gray-800">
              {user.patientId || "Not Available"}
            </h4>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <FaPhoneAlt />
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone Number</p>
            <h4 className="font-semibold text-gray-800">
              {user.phone || "Not Available"}
            </h4>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <FaEnvelope />
          </div>
          <div>
            <p className="text-xs text-gray-500">Email Address</p>
            <h4 className="font-semibold text-gray-800 break-all">
              {user.email || "Not Available"}
            </h4>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
            <FaMapMarkerAlt />
          </div>
          <div>
            <p className="text-xs text-gray-500">Address</p>
            <h4 className="font-semibold text-gray-800">
              {user.address || "Not Available"}
            </h4>
          </div>
        </div>

        {/* Gender */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <FaVenusMars />
          </div>
          <div>
            <p className="text-xs text-gray-500">Gender</p>
            <h4 className="font-semibold text-gray-800">
              {user.gender || "Not Available"}
            </h4>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <FaBirthdayCake />
          </div>
          <div>
            <p className="text-xs text-gray-500">Date of Birth</p>
            <h4 className="font-semibold text-gray-800">
              {user.dob || "Not Available"}
            </h4>
          </div>
        </div>

        {/* Critical Allergies Section */}
        <div className="flex items-start gap-4 border-t border-dashed border-slate-200 pt-5">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <FaShieldVirus />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-semibold">Known Allergies</p>
            {allergies && allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {allergies.map((item) => (
                  <span 
                    key={item.id} 
                    className="text-xs font-semibold bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-lg"
                  >
                    {item.allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-emerald-600 mt-1">No allergies reported</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}