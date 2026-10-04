const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models
const Patient = require('../models/PatientProfile');
const User = require('../models/User');

// Centralized Middleware Import
const { protect, patientOnly } = require('../middleware/authMiddleware');

// ==========================================
// 1. GET ALL PATIENTS
// Route: GET /api/patient
// ==========================================
router.get('/', protect, async (req, res) => {
  try {
    const patients = await Patient.find({})
      .select('-password')
      .sort({ updatedAt: -1 });

    return res.status(200).json(patients);
  } catch (error) {
    console.error("Backend GET Error:", error);
    return res.status(500).json({ error: "Internal Server Error retrieving patient list." });
  }
});

// ==========================================
// 2. SEARCH PATIENTS
// Route: GET /api/patient/search?query=...
// ==========================================
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(200).json([]);
    }

    const sanitizedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(sanitizedQuery, 'i');

    const patients = await Patient.find({
      $or: [
        { patientId: searchRegex },
        { fullName: searchRegex },
        { phone: searchRegex },
        { nic: searchRegex }
      ]
    }).select('-password');

    return res.status(200).json(patients);
  } catch (error) {
    console.error("Backend SEARCH Error:", error);
    return res.status(500).json({ error: "Internal Server Error searching patients." });
  }
});

// ==========================================
// 3. GET LOGGED-IN PATIENT DASHBOARD
// Route: GET /api/patient/dashboard
// ==========================================
router.get('/dashboard', protect, patientOnly, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized dashboard access attempt." });
    }

    const userId = req.user._id;
    const userEmail = req.user.email;
    
    let profile = await Patient.findOne({ user: userId }).select('-password');
    
    if (!profile) {
      profile = await Patient.findById(userId).select('-password');
    }

    if (!profile && userEmail) {
      profile = await Patient.findOne({ email: userEmail }).select('-password');
    }
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    return res.status(200).json({ 
      status: "Success", 
      user: {
        name: profile.fullName || "Patient",
        patientId: profile.patientId || "N/A",
        bloodGroup: profile.bloodGroup || "N/A",
        dob: profile.dob ? new Date(profile.dob).toLocaleDateString() : "N/A",
        phone: profile.phone || "N/A",
        email: profile.email || "N/A",
        address: profile.address || "N/A",
        gender: profile.gender || "N/A"
      },
      medicalHistory: profile.medicalHistory || [],
      surgeries: profile.surgeries || [],
      allergies: profile.allergies || [],
      vaccinations: profile.vaccinations || [],
      prescriptions: profile.prescriptions || [],
      emergencyContact: {
        name: profile.guardianName || "N/A",
        relationship: "Guardian",
        phone: profile.guardianPhone || "N/A"
      }
    });
  } catch (error) {
    console.error("Backend DASHBOARD Error:", error);
    return res.status(500).json({ error: "Internal Server Error fetching dashboard data." });
  }
});

// ==========================================
// 4. CREATE PATIENT PROFILE
// Route: POST /api/patient/test-profile
// ==========================================
router.post('/test-profile', protect, async (req, res) => {
  let savedUser = null;

  try {
    const {
      fullName,
      nic,
      dob,
      gender,
      phone,
      address,
      bloodGroup,
      email,
      password,
      guardianName,
      guardianPhone,
      patientId,
      qrCodeData
    } = req.body;

    // Basic validation check
    if (!fullName || !nic || !dob || !gender || !phone || !address || !email || !password || !guardianName || !guardianPhone) {
      return res.status(400).json({ error: "Please provide all required registration fields." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check for existing User record
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    // Check for existing Patient record
    const existingPatient = await Patient.findOne({ $or: [{ email: cleanEmail }, { nic }] });
    if (existingPatient) {
      return res.status(400).json({ error: "A patient profile with this Email or National ID (NIC) already exists." });
    }

    // 1. Create linked Auth User account
    const newUser = new User({
      email: cleanEmail,
      password,
      role: 'Patient'
    });
    savedUser = await newUser.save();

    // 2. Generate fallback values if omitted
    const generatedPatientId = patientId ? patientId.toUpperCase() : `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedQrData = qrCodeData || `MEDNET-VALIDATION-NODE-${generatedPatientId}-${nic}`;

  // 3. Instantiate Patient Profile (added password here)
    const newPatient = new Patient({
      user: savedUser._id,
      patientId: generatedPatientId,
      fullName,
      nic,
      dob: new Date(dob),
      gender,
      phone,
      address,
      bloodGroup: bloodGroup || 'O+',
      email: cleanEmail,
      password, // <--- ADD THIS LINE RIGHT HERE
      guardianName,
      guardianPhone,
      qrCodeData: generatedQrData
    });

    const savedPatient = await newPatient.save();

    const responseData = savedPatient.toObject();
    delete responseData.password;

    return res.status(201).json({
      success: true,
      message: "Patient profile saved to secure medical database.",
      data: responseData
    });

  } catch (error) {
    // Roll back User registration if Patient profile creation fails
    if (savedUser && savedUser._id) {
      await User.findByIdAndDelete(savedUser._id);
    }

    console.error("Backend Registry Error (Detailed Stack Trace):", error);
    return res.status(500).json({ 
      error: error.message || "Internal Server Error saving patient record.", 
      details: error.name || "Database Operation Error" 
    });
  }
});

// ==========================================
// 5. GET PATIENT BY ID (PAT-123456, NIC, or Mongo _id)
// Route: GET /api/patient/:id
// ==========================================
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    let patient = null;

    if (id && id.toUpperCase().startsWith('PAT-')) {
      patient = await Patient.findOne({ patientId: id.toUpperCase() }).select('-password');
    }

    if (!patient && mongoose.Types.ObjectId.isValid(id)) {
      patient = await Patient.findById(id).select('-password');
    }

    if (!patient) {
      patient = await Patient.findOne({
        $or: [{ patientId: id }, { nic: id }]
      }).select('-password');
    }

    if (!patient) {
      return res.status(404).json({ 
        error: `Patient record "${id}" could not be found in the database.` 
      });
    }

    return res.status(200).json(patient);
  } catch (error) {
    console.error("Backend GET BY ID Error:", error);
    return res.status(500).json({ error: "Internal Server Error retrieving patient profile." });
  }
});

// ==========================================
// 6. UPDATE PATIENT
// Route: PUT /api/patient/:id
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, bloodGroup, phone, dob, address, guardianName, guardianPhone } = req.body;

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;
    if (phone !== undefined) updateFields.phone = phone;
    if (dob !== undefined) updateFields.dob = dob;
    if (address !== undefined) updateFields.address = address;
    if (guardianName !== undefined) updateFields.guardianName = guardianName;
    if (guardianPhone !== undefined) updateFields.guardianPhone = guardianPhone;

    let updatedPatient = null;

    if (id && id.toUpperCase().startsWith('PAT-')) {
      updatedPatient = await Patient.findOneAndUpdate(
        { patientId: id.toUpperCase() },
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password');
    }

    if (!updatedPatient && mongoose.Types.ObjectId.isValid(id)) {
      updatedPatient = await Patient.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password');
    }

    if (!updatedPatient) {
      updatedPatient = await Patient.findOneAndUpdate(
        { nic: id },
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password');
    }

    if (!updatedPatient) {
      return res.status(404).json({ error: "Patient profile not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Patient profile updated successfully.",
      data: updatedPatient
    });
  } catch (error) {
    console.error("Backend UPDATE Error:", error);
    return res.status(500).json({ error: "Internal Server Error saving patient modifications." });
  }
});

module.exports = router;