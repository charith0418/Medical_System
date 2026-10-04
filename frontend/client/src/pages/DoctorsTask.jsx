import React, { useState, useEffect } from "react";
import axios from "axios";

import AdminSidebar from "../components/admin/Dashboard/AdminSidebar";
import AdminNavbar from "../components/admin/Dashboard/AdminNavebar";
import DoctorModal from "../components/admin/doctors/DoctorModal";
import DoctorTable from "../components/admin/doctors/DoctorTable";
import ViewDoctorModal from "../components/admin/doctors/ViewDoctorModal";

export default function DoctorsTask() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const doctorsPerPage = 5;

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch doctors from backend
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/doctors", authHeader);
      
      const formatted = res.data.map((doc) => ({
        id: doc._id,
        _id: doc._id,
        doctorId: doc.doctorId || "N/A",
        name: `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || doc.email,
        firstName: doc.firstName || "",
        lastName: doc.lastName || "",
        specialization: doc.specialization || "General",
        email: doc.email || "",
        phone: doc.phone || "",
        nic: doc.nic || "",
        license: doc.medicalLicenseNo || "",
      }));
      setDoctors(formatted);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctor records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Add new doctor
  const addDoctor = async (newDoctor) => {
    try {
      await axios.post("http://localhost:5000/api/admin/doctors", newDoctor, authHeader);
      fetchDoctors();
      setOpenModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create doctor account.");
    }
  };

  // View Doctor
  const handleView = (doctor) => {
    setSelectedDoctor(doctor);
    setViewOpen(true);
  };

  // Edit Doctor
  const handleEdit = (doctor) => {
    setEditDoctor(doctor);
    setIsEdit(true);
    setOpenModal(true);
  };

  // Update Doctor
  const updateDoctor = async (updatedDoctor) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/doctors/${updatedDoctor.id || updatedDoctor._id}`,
        updatedDoctor,
        authHeader
      );
      fetchDoctors();
      setOpenModal(false);
      setIsEdit(false);
      setEditDoctor(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update doctor details.");
    }
  };

  // Delete Doctor
  const deleteDoctor = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/doctors/${id}`, authHeader);
        fetchDoctors();
      } catch (err) {
        alert("Failed to delete doctor.");
      }
    }
  };

  // Auto-generate ID
  const getNextDoctorId = () => {
    if (doctors.length === 0) {
      return "DOC/0001";
    }

    const validNumbers = doctors
      .map((doctor) => {
        const num = Number(String(doctor.doctorId).replace("DOC/", ""));
        return isNaN(num) ? 0 : num;
      })
      .filter((num) => num > 0);

    const maxNumber = validNumbers.length > 0 ? Math.max(...validNumbers) : 0;
    return `DOC/${String(maxNumber + 1).padStart(4, "0")}`;
  };

  // Filter Doctor
  const filteredDoctors = doctors.filter(
    (doctor) =>
      (doctor.doctorId && doctor.doctorId.toLowerCase().includes(search.toLowerCase())) ||
      (doctor.name && doctor.name.toLowerCase().includes(search.toLowerCase())) ||
      (doctor.specialization && doctor.specialization.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination Logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;

  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage) || 1;

  return (
    <div className="flex min-h-screen bg-gray-100 w-full overflow-x-hidden">
      {/* Sidebar - Fixed width */}
      <AdminSidebar />

      {/* Main Content Area - Expands properly to fill container */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto">
        <AdminNavbar admin={{ name: "Admin" }} />

        {/* Header */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Doctor Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage doctor accounts and information.
            </p>
          </div>

          <button
            onClick={() => {
              setIsEdit(false);
              setEditDoctor(null);
              setOpenModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow self-start md:self-auto"
          >
            + Add Doctor
          </button>
        </div>

        {/* Search & Summary */}
        <div className="mt-6">
          <div className="flex justify-between">
            <input
              type="text"
              placeholder="Search by ID, Name or Specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Doctor Table */}
        <div className="mt-6">
          {loading ? (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-sm">
              Loading doctor data...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 bg-white rounded-xl shadow-sm">
              {error}
            </div>
          ) : (
            <DoctorTable
              doctors={currentDoctors}
              totalDoctors={doctors.length}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={deleteDoctor}
            />
          )}
        </div>

        {/* Pagination Buttons */}
        {!loading && !error && (
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Add & Edit Modal */}
      <DoctorModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setIsEdit(false);
          setEditDoctor(null);
        }}
        addDoctor={addDoctor}
        updateDoctor={updateDoctor}
        nextDoctorId={getNextDoctorId()}
        isEdit={isEdit}
        doctor={editDoctor}
      />

      {/* View Doctor Modal */}
      <ViewDoctorModal
        open={viewOpen}
        doctor={selectedDoctor}
        onClose={() => {
          setViewOpen(false);
          setSelectedDoctor(null);
        }}
      />
    </div>
  );
}