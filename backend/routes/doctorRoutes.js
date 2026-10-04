const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor"); // Adjust path if your model is named differently (e.g. Doctor.js)

// 1. GET Doctor profile by Email (Used by DoctorDashboard)
// Endpoint: GET /api/doctors/profile?email=doctor@example.com
router.get("/profile", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email query parameter is required." 
      });
    }

    // Find doctor matching email (case-insensitive)
    const doctor = await Doctor.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, "i") } 
    });

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor profile not found for this email address." 
      });
    }

    res.status(200).json({
      success: true,
      doctorId: doctor.doctorId || doctor._id,
      name: doctor.name || doctor.fullName,
      email: doctor.email,
      specialty: doctor.specialty || "General Medicine",
      department: doctor.department || "Outpatient Department"
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching doctor profile.", 
      error: error.message 
    });
  }
});

// 2. GET All Doctors List (Optional: For dropdowns/admin views)
// Endpoint: GET /api/doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching doctors list.", 
      error: error.message 
    });
  }
});

module.exports = router;