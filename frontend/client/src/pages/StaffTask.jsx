import React, { useState, useEffect } from "react";
import axios from "axios";

import AdminSidebar from "../components/admin/Dashboard/AdminSidebar";
import AdminNavbar from "../components/admin/Dashboard/AdminNavebar";
import StaffModal from "../components/admin/staff/StaffModal";
import StaffTable from "../components/admin/staff/StaffTable";
import ViewStaffModal from "../components/admin/staff/ViewStaffModal";

export default function StaffTasks() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const staffPerPage = 5;

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch staff from backend
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/staff", authHeader);
      
      const formatted = res.data.map((member) => ({
        id: member._id,
        _id: member._id,
        staffId: member.staffId || "N/A",
        name: `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.name || member.email,
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        role: member.role || "Staff",
        email: member.email || "",
        phone: member.phone || "",
        nic: member.nic || "",
      }));
      setStaff(formatted);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to load staff records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Add new staff
  const addStaff = async (newStaff) => {
    try {
      await axios.post("http://localhost:5000/api/admin/staff", newStaff, authHeader);
      fetchStaff();
      setOpenModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create staff account.");
    }
  };

  // View Staff
  const handleView = (staffMember) => {
    setSelectedStaff(staffMember);
    setViewOpen(true);
  };

  // Edit Staff
  const handleEdit = (staffMember) => {
    setEditStaff(staffMember);
    setIsEdit(true);
    setOpenModal(true);
  };

  // Update Staff
  const updateStaff = async (updatedStaff) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/staff/${updatedStaff.id || updatedStaff._id}`,
        updatedStaff,
        authHeader
      );
      fetchStaff();
      setOpenModal(false);
      setIsEdit(false);
      setEditStaff(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update staff details.");
    }
  };

  // Delete Staff
  const deleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/staff/${id}`, authHeader);
        fetchStaff();
      } catch (err) {
        alert("Failed to delete staff member.");
      }
    }
  };

  // Auto-generate ID
  const getNextStaffId = () => {
    if (staff.length === 0) {
      return "STF/0001";
    }

    const validNumbers = staff
      .map((member) => {
        const num = Number(String(member.staffId).replace("STF/", ""));
        return isNaN(num) ? 0 : num;
      })
      .filter((num) => num > 0);

    const maxNumber = validNumbers.length > 0 ? Math.max(...validNumbers) : 0;
    return `STF/${String(maxNumber + 1).padStart(4, "0")}`;
  };

  // Filter Staff
  const filteredStaff = staff.filter(
    (member) =>
      (member.staffId && member.staffId.toLowerCase().includes(search.toLowerCase())) ||
      (member.name && member.name.toLowerCase().includes(search.toLowerCase())) ||
      (member.role && member.role.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination Logic
  const indexOfLastStaff = currentPage * staffPerPage;
  const indexOfFirstStaff = indexOfLastStaff - staffPerPage;

  const currentStaff = filteredStaff.slice(
    indexOfFirstStaff,
    indexOfLastStaff
  );

  const totalPages = Math.ceil(filteredStaff.length / staffPerPage) || 1;

  return (
    <div className="flex min-h-screen bg-gray-100 w-full overflow-x-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto">
        <AdminNavbar admin={{ name: "Admin" }} />

        {/* Header */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Staff Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage hospital staff accounts and information.
            </p>
          </div>

          <button
            onClick={() => {
              setIsEdit(false);
              setEditStaff(null);
              setOpenModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow self-start md:self-auto"
          >
            + Add Staff
          </button>
        </div>

        {/* Search & Summary */}
        <div className="mt-6">
          <div className="flex justify-between">
            <input
              type="text"
              placeholder="Search by ID, Name or Role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-96 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Staff Table */}
        <div className="mt-6">
          {loading ? (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-sm">
              Loading staff data...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 bg-white rounded-xl shadow-sm">
              {error}
            </div>
          ) : (
            <StaffTable
              staff={currentStaff}
              totalStaff={staff.length}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={deleteStaff}
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

      {/* Add & Edit Staff Modal */}
      <StaffModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setIsEdit(false);
          setEditStaff(null);
        }}
        addStaff={addStaff}
        updateStaff={updateStaff}
        nextStaffId={getNextStaffId()}
        isEdit={isEdit}
        staff={editStaff}
      />

      {/* View Staff Modal */}
      <ViewStaffModal
        open={viewOpen}
        staff={selectedStaff}
        onClose={() => {
          setViewOpen(false);
          setSelectedStaff(null);
        }}
      />
    </div>
  );
}