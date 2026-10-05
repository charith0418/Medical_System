import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function DoctorModal({
  open,
  onClose,
  addDoctor,
  nextDoctorId,
  isEdit,
  doctor,
  updateDoctor,
}) {
  const doctorId = isEdit ? doctor?.doctorId : nextDoctorId;

  const email = isEdit
    ? doctor?.email
    : `doc${String(doctorId || "").replace("DOC/", "").toLowerCase()}@dr.mh.ac.lk`;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [license, setLicense] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Populate data when editing an existing doctor
  useEffect(() => {
    if (isEdit && doctor) {
      const cleanName = (doctor.name || "").replace("Dr. ", "").trim();
      const names = cleanName.split(" ");

      setFirstName(doctor.firstName || names[0] || "");
      setLastName(doctor.lastName || names.slice(1).join(" ") || "");
      setPhone(doctor.phone && doctor.phone !== "N/A" ? doctor.phone : "");
      setNic(doctor.nic && doctor.nic !== "N/A" ? doctor.nic : "");
      setSpecialization(doctor.specialization || doctor.specialty || "");
      setLicense(
        doctor.license && doctor.license !== "N/A"
          ? doctor.license
          : doctor.medicalLicenseNo && doctor.medicalLicenseNo !== "N/A"
          ? doctor.medicalLicenseNo
          : ""
      );
      setPassword("");
      setConfirmPassword("");
    } else {
      resetForm();
    }
  }, [doctor, isEdit, open]);

  if (!open) return null;

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setNic("");
    setSpecialization("");
    setLicense("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleRegister = () => {
    // 1. Edit Doctor Flow
    if (isEdit) {
      const updatedDoctor = {
        id: doctor.id || doctor._id,
        _id: doctor._id || doctor.id,
        doctorId: doctor.doctorId,
        name: `Dr. ${firstName.trim()} ${lastName.trim()}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        specialization,
        specialty: specialization,
        email: doctor.email,
        phone: phone.trim(),
        nic: nic.trim(),
        license: license.trim(),
        medicalLicenseNo: license.trim(),
      };

      updateDoctor(updatedDoctor);
      resetForm();
      onClose();
      return;
    }

    // 2. Add Doctor Validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !nic.trim() ||
      !specialization ||
      !license.trim() ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    // 3. Create Doctor Payload (now includes password, nic, and license!)
    const newDoctor = {
      doctorId,
      name: `Dr. ${firstName.trim()} ${lastName.trim()}`.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      specialization,
      specialty: specialization,
      email,
      phone: phone.trim(),
      nic: nic.trim(),
      license: license.trim(),
      medicalLicenseNo: license.trim(),
      password: password.trim(), // <--- Custom password is now sent to backend!
    };

    addDoctor(newDoctor);
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Edit Doctor Details" : "Register New Doctor"}
            </h1>
            <p className="text-blue-100 text-sm">
              {isEdit
                ? "Update doctor credentials and profile details"
                : "Create a new doctor account with access credentials"}
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={26} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-10 py-8 max-h-[75vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Doctor ID
              </label>
              <input
                type="text"
                value={doctorId}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-600 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-600 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Charith"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Kalhara"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                NIC / National ID *
              </label>
              <input
                type="text"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                placeholder="e.g. 199512345678"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Specialization *
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">Select Specialization</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Dentist">Dentist</option>
                <option value="General">General Practice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Medical License No. *
              </label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="e.g. SLMC-12345"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {!isEdit && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                    Login Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set doctor portal password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-8 py-4 flex justify-end gap-3">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleRegister}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-semibold text-sm hover:opacity-90 shadow-md transition"
          >
            {isEdit ? "Save Changes" : "Register Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}