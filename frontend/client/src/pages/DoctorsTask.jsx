import React, { useState, useEffect } from "react";
import axios from "axios";

import DoctorModal from "../components/admin/doctors/DoctorModal";
import DoctorTable from "../components/admin/doctors/DoctorTable";
import ViewDoctorModal from "../components/admin/doctors/ViewDoctorModal";

const RAW_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://medical-system-5fwx.onrender.com";
const CLEAN_BASE_URL = RAW_URL.replace(/\/api\/?$/, "");

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

  const getAuthHeader = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${CLEAN_BASE_URL}/api/admin/doctors`, getAuthHeader());

      const rawList = Array.isArray(res.data) ? res.data : [];
      const formatted = rawList.map((doc) => ({
        id: doc._id || doc.id,
        _id: doc._id || doc.id,
        doctorId: doc.doctorId || "N/A",
        name: doc.name || `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || doc.email || "Doctor",
        firstName: doc.firstName || "",
        lastName: doc.lastName || "",
        specialization: doc.specialty || doc.specialization || "General",
        specialty: doc.specialty || doc.specialization || "General",
        email: doc.email || "",
        phone: doc.phone || "N/A",
        nic: doc.nic || "N/A",
        license: doc.medicalLicenseNo || doc.license || "N/A",
        medicalLicenseNo: doc.medicalLicenseNo || doc.license || "N/A",
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

  const addDoctor = async (newDoctor) => {
    try {
      await axios.post(`${CLEAN_BASE_URL}/api/admin/doctors`, newDoctor, getAuthHeader());
      await fetchDoctors();
      setOpenModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create doctor account.");
    }
  };

  const updateDoctor = async (updatedDoctor) => {
    try {
      const docId = updatedDoctor._id || updatedDoctor.id;
      await axios.put(`${CLEAN_BASE_URL}/api/admin/doctors/${docId}`, updatedDoctor, getAuthHeader());
      await fetchDoctors();
      setOpenModal(false);
      setIsEdit(false);
      setEditDoctor(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update doctor details.");
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await axios.delete(`${CLEAN_BASE_URL}/api/admin/doctors/${id}`, getAuthHeader());
      await fetchDoctors();
    } catch (err) {
      alert("Failed to delete doctor.");
    }
  };

  const handleView = (doctor) => {
    setSelectedDoctor(doctor);
    setViewOpen(true);
  };

  const handleEdit = (doctor) => {
    setEditDoctor(doctor);
    setIsEdit(true);
    setOpenModal(true);
  };

  const getNextDoctorId = () => {
    if (!doctors || doctors.length === 0) return "DOC/0001";
    const validNumbers = doctors
      .map((d) => Number(String(d.doctorId || "").replace("DOC/", "")))
      .filter((num) => !isNaN(num) && num > 0);
    const maxNumber = validNumbers.length > 0 ? Math.max(...validNumbers) : 0;
    return `DOC/${String(maxNumber + 1).padStart(4, "0")}`;
  };

  // Safe filter using optional chaining so undefined values never throw an error
  const safeList = Array.isArray(doctors) ? doctors : [];
  const filteredDoctors = safeList.filter((doc) => {
    const q = (search || "").toLowerCase().trim();
    if (!q) return true;
    const idMatch = doc.doctorId ? String(doc.doctorId).toLowerCase().includes(q) : false;
    const nameMatch = doc.name ? String(doc.name).toLowerCase().includes(q) : false;
    const specMatch = (doc.specialization || doc.specialty)
      ? String(doc.specialization || doc.specialty).toLowerCase().includes(q)
      : false;
    return idMatch || nameMatch || specMatch;
  });

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage) || 1;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Doctor Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage official doctor accounts and system permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setIsEdit(false);
            setEditDoctor(null);
            setOpenModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow transition cursor-pointer self-start md:self-auto"
        >
          + Add Doctor
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Search by ID, Name or Specialization..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-96 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        />
      </div>

      {/* Doctor Table */}
      <div className="mt-6">
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
            Loading doctor profiles...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600 bg-white rounded-2xl shadow-sm border border-rose-100">
            {error}
          </div>
        ) : (
          <DoctorTable
            doctors={currentDoctors}
            totalDoctors={filteredDoctors.length}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={deleteDoctor}
          />
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && !error && filteredDoctors.length > doctorsPerPage && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-xs font-semibold text-gray-700 transition"
          >
            Previous
          </button>

          <span className="text-xs font-medium text-gray-500">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-xs font-semibold text-gray-700 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
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