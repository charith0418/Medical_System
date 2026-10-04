const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Adjust model import path to match your exact file name case
const PatientProfile = require('../models/PatientProfile');

// POST /api/visitations -> Record visit, history, prescriptions, and allergies
router.post('/', async (req, res) => {
  try {
    const { 
      patientId, 
      doctorId, 
      doctorName, 
      doctor,
      fullName,
      date, 
      diagnosis, 
      notes, 
      reportedAllergies, 
      prescriptions 
    } = req.body;

    console.log("Saving visit for patientId:", patientId);

    if (!patientId) {
      return res.status(400).json({ 
        success: false, 
        message: "patientId is required" 
      });
    }

    // 1. Resolve Doctor Name from all possible payload key variants
    const resolvedDoctorName = 
      doctorName || 
      doctor || 
      fullName || 
      (req.user && (req.user.fullName || req.user.name)) || 
      "Dr. Medical Officer";

    // 2. Query patient by custom patientId (e.g., "PAT-582194") or MongoDB _id
    let query = { patientId: patientId };
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      query = { $or: [{ patientId: patientId }, { _id: patientId }] };
    }

    const patient = await PatientProfile.findOne(query);

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: `Patient profile '${patientId}' not found.` 
      });
    }

    const currentDate = date || new Date().toISOString().split("T")[0];

    // 3. Append to Medical History
    if (!Array.isArray(patient.history)) {
      patient.history = [];
    }

    patient.history.unshift({
      date: currentDate,
      doctorId: doctorId || "",
      doctorName: resolvedDoctorName,
      diagnosis: diagnosis || "General Visit",
      notes: notes || ""
    });

    // 4. Append Prescriptions to Medication Logs
    if (Array.isArray(prescriptions) && prescriptions.length > 0) {
      if (!Array.isArray(patient.prescriptions)) {
        patient.prescriptions = [];
      }

      const newRx = prescriptions.map((p) => ({
        medicineName: p.medicineName || p.drug || p.name || "Unspecified",
        dosage: p.dosage || "As directed",
        duration: p.duration || "N/A",
        prescribedBy: resolvedDoctorName,
        date: currentDate
      }));

      patient.prescriptions.push(...newRx);
    }

    // 5. Append Allergies dynamically without duplicates
    if (reportedAllergies && typeof reportedAllergies === 'string' && reportedAllergies.trim() !== '') {
      const existingAllergies = Array.isArray(patient.allergies) ? patient.allergies : [];
      const newAllergies = reportedAllergies
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);

      patient.allergies = Array.from(new Set([...existingAllergies, ...newAllergies]));
    }

    // Inform Mongoose that nested array sub-documents have changed
    patient.markModified('history');
    patient.markModified('prescriptions');
    patient.markModified('allergies');

    // 6. Save updated profile
    const updatedPatient = await patient.save();

    return res.status(200).json({ 
      success: true, 
      message: "Visit recorded successfully!",
      updatedPatient
    });

  } catch (error) {
    console.error("Internal Server Error on /api/visitations:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error saving visit: " + error.message 
    });
  }
});

module.exports = router;