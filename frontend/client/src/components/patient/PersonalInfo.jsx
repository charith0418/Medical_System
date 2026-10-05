import React from "react";
import {
  FaUser,
  FaIdCard,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaVenusMars,
  FaCalendarAlt,
  FaShieldAlt,
} from "react-icons/fa";

export default function PersonalInfo({ user = {}, allergies = [] }) {
  // Resolve allergies from props or user object
  const rawAllergies =
    (Array.isArray(allergies) && allergies.length > 0 ? allergies : null) ||
    (Array.isArray(user?.allergies) && user.allergies.length > 0 ? user.allergies : null) ||
    (Array.isArray(user?.knownAllergies) && user.knownAllergies.length > 0 ? user.knownAllergies : null) ||
    [];

  // Helper to extract string name whether item is a string or object
  const getAllergyName = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item.name || item.allergy || item.title || item.value || "Allergy";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col justify-between text-left">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
        <p className="text-sm text-gray-500 mb-6">Patient basic details & health alerts</p>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <FaUser />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Full Name</p>
              <p className="text-sm font-bold text-slate-900">
                {user?.fullName || user?.name || "Charith Kalhara"}
              </p>
            </div>
          </div>

          {/* Patient ID */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FaIdCard />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Patient ID</p>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {user?.patientId || "PAT-348741"}
              </p>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FaPhoneAlt />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Phone Number</p>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {user?.phone || "0754660204"}
              </p>
            </div>
          </div>

          {/* Email Address */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FaEnvelope />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Email Address</p>
              <p className="text-sm font-bold text-slate-900">
                {user?.email || "kalharacharith69@gmail.com"}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <FaMapMarkerAlt />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Address</p>
              <p className="text-sm font-bold text-slate-900">
                {user?.address || "1450 Biscayne Blvd, Miami, FL 33132"}
              </p>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FaVenusMars />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Gender</p>
              <p className="text-sm font-bold text-slate-900">
                {user?.gender || "Male"}
              </p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
              <FaCalendarAlt />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Date of Birth</p>
              <p className="text-sm font-bold text-slate-900">
                {user?.dob || "4/18/2003"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Known Allergies Section */}
      <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            rawAllergies.length > 0
              ? "bg-rose-50 text-rose-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          <FaShieldAlt className="text-lg" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Known Allergies</p>
          {rawAllergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {rawAllergies.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-md tracking-wider uppercase inline-flex items-center gap-1 shadow-2xs"
                >
                  ⚠️ {getAllergyName(item)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-emerald-600 mt-0.5">
              No allergies reported
            </p>
          )}
        </div>
      </div>
    </div>
  );
}