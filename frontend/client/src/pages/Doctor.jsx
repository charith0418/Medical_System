import React from "react";
import DoctorDashboard from "../components/doctor/DoctorDashboard";

// Accept the onLogout function prop passed down from App.jsx
function Doctor({ onLogout }) {
  return (
    // Pass onLogout down into your main smart DoctorDashboard panel manager
    <DoctorDashboard onLogout={onLogout} />
  );
}

export default Doctor;