const mongoose = require("mongoose");
const PatientProfile = require("../models/PatientProfile");
const User = require("../models/User");

// GET ALL PATIENTS
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await PatientProfile.find({})
      .select("-password")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve records from database",
      error: error.message,
    });
  }
};

// SEARCH PATIENTS
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    const sanitizedQuery = query
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const searchRegex = new RegExp(sanitizedQuery, "i");

    const patients = await PatientProfile.find({
      $or: [
        { patientId: searchRegex },
        { fullName: searchRegex },
        { phone: searchRegex },
        { nic: searchRegex },
      ],
    }).select("-password");

    return res.status(200).json(patients);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to perform patient search",
      error: error.message,
    });
  }
};

// GET PATIENT BY ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    let patient = null;

    if (id && id.startsWith("PAT-")) {
      patient = await PatientProfile.findOne({ patientId: id })
        .select("-password")
        .populate("prescriptions")
        .populate("history");
    }

    if (!patient && mongoose.Types.ObjectId.isValid(id)) {
      patient = await PatientProfile.findById(id)
        .select("-password")
        .populate("prescriptions")
        .populate("history");
    }

    if (!patient) {
      patient = await PatientProfile.findOne({
        $or: [{ patientId: id }, { nic: id }],
      })
        .select("-password")
        .populate("prescriptions")
        .populate("history");
    }

    if (!patient) {
      return res.status(404).json({
        message: `Patient profile matching identifier "${id}" could not be found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Database error searching profile registry.",
      error: error.message,
    });
  }
};

// UPDATE PATIENT
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      bloodGroup,
      phone,
      dob,
      address,
      guardianName,
      guardianPhone,
      allergies,
    } = req.body;

    const updateFields = {};

    if (fullName !== undefined) updateFields.fullName = fullName;
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;
    if (phone !== undefined) updateFields.phone = phone;
    if (dob !== undefined) updateFields.dob = dob;
    if (address !== undefined) updateFields.address = address;
    if (guardianName !== undefined) updateFields.guardianName = guardianName;
    if (guardianPhone !== undefined)
      updateFields.guardianPhone = guardianPhone;

    const updateQuery = { $set: updateFields };

    if (allergies) {
      updateQuery.$addToSet = { allergies };
    }

    let updatedProfile = null;

    if (id && id.startsWith("PAT-")) {
      updatedProfile = await PatientProfile.findOneAndUpdate(
        { patientId: id },
        updateQuery,
        { new: true, runValidators: true }
      ).select("-password");
    }

    if (!updatedProfile && mongoose.Types.ObjectId.isValid(id)) {
      updatedProfile = await PatientProfile.findByIdAndUpdate(
        id,
        updateQuery,
        { new: true, runValidators: true }
      ).select("-password");
    }

    if (!updatedProfile) {
      return res.status(404).json({
        message: "Patient profile record not found",
      });
    }

    return res.status(200).json({
      message: "Record updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Database update transaction failed",
      error: error.message,
    });
  }
};

// GET PATIENT DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Unauthorized dashboard access attempt",
      });
    }

    const profile = await PatientProfile.findOne({
      user: req.user._id,
    })
      .select("-password")
      .populate("prescriptions")
      .populate("history");

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      dashboardData: profile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching dashboard",
      error: error.message,
    });
  }
};

// CREATE PATIENT PROFILE
exports.createTestProfile = async (req, res) => {
  let savedUser = null;
  let savedProfile = null;

  try {
    console.log("\n=========================================");
    console.log("📥 [BACKEND LOG] Incoming Data from Form:", req.body);

    const {
      fullName,
      nic,
      dob,
      gender,
      phone,
      phoneNumber,
      contactNo,
      mobile,
      bloodGroup,
      address,
      email,
      password,
      guardianName,
      guardianPhone,
      patientId,
      qrCodeData,
    } = req.body;

    const recipientPhone = phone || phoneNumber || contactNo || mobile;

    if (!fullName || !nic || !dob || !recipientPhone || !email) {
      console.log("❌ Validation failed: Missing required fields.");

      return res.status(400).json({
        success: false,
        message: "Failed creating profile",
        error:
          "Missing required fields: Full Name, NIC, DOB, Phone, or Email.",
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPhone = String(recipientPhone).trim();
    const cleanNic = String(nic).trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Failed creating profile",
        error: "This email address is already registered.",
      });
    }

    const existingProfile = await PatientProfile.findOne({
      $or: [{ nic: cleanNic }, { email: cleanEmail }],
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Failed creating profile",
        error: "A patient with this NIC or Email already exists.",
      });
    }

    const dobObject = new Date(dob);

    if (Number.isNaN(dobObject.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Failed creating profile",
        error: "Invalid date of birth.",
      });
    }

    let dobPasswordFormatted = "";

    if (typeof dob === "string") {
      dobPasswordFormatted = dob.replace(/\D/g, "");
    } else {
      dobPasswordFormatted = dobObject
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
    }

    const defaultPassword = password || dobPasswordFormatted;

    const generatedId =
      patientId || `PAT-${Math.floor(100000 + Math.random() * 900000)}`;

    const qrData =
      qrCodeData ||
      `MEDNET-VALIDATION-NODE-${generatedId}-${cleanNic}`;

    // Create User
    const newUser = new User({
      email: cleanEmail,
      password: defaultPassword,
      role: "Patient",
    });

    savedUser = await newUser.save();

    // Create Patient Profile
    savedProfile = await PatientProfile.create({
      user: savedUser._id,
      patientId: generatedId,
      fullName: fullName.trim(),
      nic: cleanNic,
      dob: dobObject,
      gender: gender || "Other",
      phone: cleanPhone,
      bloodGroup: bloodGroup || "N/A",
      address: address ? address.trim() : "N/A",
      email: cleanEmail,
      guardianName: guardianName ? guardianName.trim() : "N/A",
      guardianPhone: guardianPhone
        ? guardianPhone.trim()
        : "N/A",
      qrCodeData: qrData,
    });

    console.log("✅ Profile created successfully in MongoDB!");
    console.log("🆔 Patient ID:", generatedId);

    return res.status(201).json({
      success: true,
      message: "Patient profile created successfully.",
      data: savedProfile,
    });
  } catch (error) {
    console.error("❌ Patient registration error:", error.message);

    if (savedProfile?._id) {
      try {
        await PatientProfile.findByIdAndDelete(savedProfile._id);
      } catch (deleteErr) {
        console.error(
          "Failed to rollback profile:",
          deleteErr.message
        );
      }
    }

    if (savedUser?._id) {
      try {
        await User.findByIdAndDelete(savedUser._id);
      } catch (deleteErr) {
        console.error(
          "Failed to rollback user:",
          deleteErr.message
        );
      }
    }

    return res.status(400).json({
      success: false,
      message: "Failed creating profile",
      error: error.message,
    });
  }
};