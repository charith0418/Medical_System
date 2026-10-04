import React from "react";
import { FaPhoneAlt, FaUserCircle, FaAmbulance } from "react-icons/fa";

export default function EmergencyContact({ emergencyContact = {} }) {
  return (
    <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Emergency Contact
          </h3>
          <p className="text-sm text-gray-500">
            Contact in case of emergency
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
          <FaAmbulance className="text-xl" />
        </div>
      </div>

      {/* Contact Card */}
      {emergencyContact.name ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center">
              <FaUserCircle className="text-3xl" />
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 text-lg">
                {emergencyContact.name}
              </h4>

              <p className="text-sm text-gray-500">
                {emergencyContact.relationship || "Relationship"}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div>
            <p className="text-lg font-semibold text-gray-700">
              {emergencyContact.phone || "Not Available"}
            </p>
          </div>

          {/* Call Button */}
          <button
            onClick={() => window.location.href = `tel:${emergencyContact.phone}`}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
          >
  <FaPhoneAlt />
  Call Now
</button>

        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400">
            No emergency contact available
          </p>
        </div>
      )}

    </div>
  );
}