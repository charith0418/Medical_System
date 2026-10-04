import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

// Sidebar & Dashboard Components
import AdminSidebar from "../components/admin/Dashboard/AdminSidebar";
import AdminNavbar from "../components/admin/Dashboard/AdminNavebar";
import StatCard from "../components/admin/Dashboard/StatCard";
import OverviewChart from "../components/admin/Dashboard/OverviewChart";
import ActivityChart from "../components/admin/Dashboard/ActivityChart";
import ActivityLogs from "../components/admin/Dashboard/ActivityLogs";

// Task Views
import DoctorsTask from "./DoctorsTask";
import StaffTask from "./StaffTask";

import { FaUsers, FaUserMd, FaUserNurse } from "react-icons/fa";

// Main Dashboard View Component
function AdminDashboardView() {
  const [dashboard, setDashboard] = useState({
    admin: { name: "" },
    stats: {
      patients: 0,
      patientsGrowth: "0%",
      doctors: 0,
      doctorsGrowth: "0%",
      staff: 0,
      staffGrowth: "0%",
    },
    overview: [],
    activity: [],
    activityLogs: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboard(response.data);
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
        setError("Failed to load dashboard data from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 font-medium text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AdminNavbar admin={dashboard.admin} />

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        <StatCard
          title="Patients"
          value={dashboard.stats.patients}
          change={dashboard.stats.patientsGrowth}
          icon={<FaUsers />}
        />

        <StatCard
          title="Doctors"
          value={dashboard.stats.doctors}
          change={dashboard.stats.doctorsGrowth}
          icon={<FaUserMd />}
        />

        <StatCard
          title="Staff"
          value={dashboard.stats.staff}
          change={dashboard.stats.staffGrowth}
          icon={<FaUserNurse />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2">
          <OverviewChart data={dashboard.overview} />
        </div>
        <ActivityChart data={dashboard.activity} />
      </div>

      {/* Activity Logs */}
      <div className="mt-6">
        <ActivityLogs logs={dashboard.activityLogs} />
      </div>
    </div>
  );
}

// Master Admin Page Layout
export default function Admin({ onLogout }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar onLogout={onLogout} />

      <main className="flex-1 ml-72 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminDashboardView />} />
          <Route path="/doctors" element={<DoctorsTask />} />
          <Route path="/staff" element={<StaffTask />} />
        </Routes>
      </main>
    </div>
  );
}