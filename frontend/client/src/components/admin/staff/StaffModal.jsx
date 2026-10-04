import React from "react";
import { useState, useEffect } from "react";
import {
  X,
}from "lucide-react";


export default function StaffModal({ open, onClose, addStaff, nextStaffId, isEdit, staff, updateStaff }) {

 
  //Auto genarate email and Id
  const staffId = isEdit
    ? staff?.staffId
    : nextStaffId;

  const email = isEdit
    ? staff?.email
    : `stf${staffId.replace("STF/", "").toLowerCase()}@dr.mh.ac.lk`;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

   //Edit staff
      useEffect(() => {
        if (isEdit && staff) {
          const names = staff.name.split(" ");

          setFirstName(names[0] || "");
          setLastName(names[1] || "");
          setPhone(staff.phone || "");
          setNic(staff.nic || "");
          setRole(staff.role || "");
        }
      }, [staff, isEdit]);

       if (!open) return null;

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setNic("");
    setRole("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleRegister = () => {

    if (isEdit) {

      const updatedStaff = {
        id: staff.id,
        staffId: staff.staffId,
        name: `${firstName} ${lastName}`,
        role,
        email: staff.email,
        phone,
        nic,
      };


      updateStaff(updatedStaff);
      resetForm();
      onClose();

      return;
    }

      // Check required fields

      if (
        !firstName ||
        !lastName ||
        !phone ||
        !nic ||
        !role ||
        !password ||
        !confirmPassword
      ) {
        alert("Please fill all fields.");
        return;
      }

      // Check password
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      // Create staff object
      const newStaff = {
        id: Date.now(),
        staffId,
        name: `${firstName} ${lastName}`,
        role,
        email,
        phone,
        nic,
      };

      // Send staff to Staff.jsx
      addStaff(newStaff);

      // Close popup
      resetForm();
      onClose();
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5">

      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}

        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-8 py-5 flex justify-between items-center">

    <div>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Staff" : "Register New Staff"}
        </h1>

        <p className="text-blue-100 text-sm">
          {isEdit
            ? "Update staff information"
            : "Create a new staff account"}
        </p>
      </div>

      <button
        onClick={() =>{
          resetForm();
          onClose();
        }}
        className="hover:bg-white/20 p-2 rounded-full transition"
      >
        <X size={28} />
      </button>

    </div>

        {/* Form */}

      <div className="px-10 py-8 max-h-[80vh] overflow-y-auto">

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">

          <div>
            <label className="block text-sm font-medium mb-2">
              Staff ID
            </label>

            <input
              type="text"
              value={staffId}
              disabled
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              First Name
            </label>

            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Last Name
            </label>

            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              NIC
            </label>

            <input
              type="text"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              placeholder="Enter NIC"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Role</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Lab Technician">Lab Technician</option>
              <option value="Pharmacist">Pharmacist</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          </div>

        </div>

        {/* Buttons */}

        <div className="border-t bg-gray-50 px-8 py-5 flex justify-end gap-4">

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-6 py-3 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={handleRegister}
           className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:opacity-90 transition"
          >
            {isEdit ? "Save Changes" : "Register Staff"}
          </button>

        </div>

      </div>

    </div>
  );
}