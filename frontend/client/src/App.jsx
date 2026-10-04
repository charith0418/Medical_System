import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import StaffSidebar from "./components/StaffSidebar";
import Patient from "./pages/Patient";
import Doctor from "./pages/Doctor";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-[#1e293b] antialiased">
        <Routes>
          {/* ================= PUBLIC (UNAUTHENTICATED) ROUTES ================= */}
          {!isAuthenticated ? (
            <>
              {/* Reset Password Route (Must be accessible without being logged in) */}
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Login Route */}
              <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />

              {/* Any other URL redirects to /login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            /* ================= PROTECTED (AUTHENTICATED) ROUTES ================= */
            <>
              {userRole === "Staff" && (
                <Route path="/*" element={<StaffSidebar onLogout={handleLogout} />} />
              )}

              {userRole === "Patient" && (
                <Route path="/*" element={<Patient onLogout={handleLogout} />} />
              )}

              {userRole === "Doctor" && (
                <Route path="/*" element={<Doctor onLogout={handleLogout} />} />
              )}

              {userRole === "Admin" && (
                <Route path="/admin/*" element={<Admin onLogout={handleLogout} />} />
              )}

              <Route
                path="*"
                element={<Navigate to={userRole === "Admin" ? "/admin" : "/"} replace />}
              />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;