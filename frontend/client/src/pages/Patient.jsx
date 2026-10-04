import React from "react";
import PatientDashboard from "../components/patient/PatientDashboard";

// CHANGED PLACE: Accept the onLogout function prop passed from App.jsx
function Patient({ onLogout }) {
  return (
    // Pass onLogout down into the smart PatientDashboard controller
    <PatientDashboard onLogout={onLogout} />
  );
}

export default Patient;