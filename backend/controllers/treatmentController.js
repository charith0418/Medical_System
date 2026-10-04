const mongoose = require('mongoose');
const Treatment = require('../models/Treatment');
const PatientProfile = require('../models/PatientProfile');

// POST /api/treatments
const addTreatment = async (req, res) => {
  const { patientId, diagnosis, notes, consultant, reportedAllergies } = req.body;

  try {
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    // Resolve patient by PAT-ID or _id
    let patient = null;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await PatientProfile.findById(patientId);
    } else {
      patient = await PatientProfile.findOne({ patientId: patientId });
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Create treatment record
    const treatment = await Treatment.create({
      patientId: patient.patientId || patientId,
      patient: patient._id,
      diagnosis: diagnosis || "General Checkup",
      notes: notes || "",
      consultant: consultant || "Dr. N. Silva"
    });

    // Update patient profile details (last visit timestamp & optional new allergies)
    const updateData = { lastVisit: new Date() };

    if (reportedAllergies && typeof reportedAllergies === 'string' && reportedAllergies.trim()) {
      updateData.$addToSet = { allergies: reportedAllergies.trim() };
    }

    await PatientProfile.findByIdAndUpdate(patient._id, updateData, { new: true });

    return res.status(201).json({
      success: true,
      message: 'Treatment saved successfully',
      treatment
    });

  } catch (error) {
    console.error("Treatment Creation Error:", error);
    return res.status(500).json({ 
      message: 'Server error while saving treatment record', 
      error: error.message 
    });
  }
};

// GET /api/treatments
const getTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find()
      .populate('patient', 'fullName patientId age gender bloodGroup')
      .sort({ createdAt: -1 });

    return res.status(200).json(treatments);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/treatments/patient/:patientId
const getTreatmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    let query = { patientId: patientId };

    // Support lookup by Mongo _id as well
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      const patient = await PatientProfile.findById(patientId);
      if (patient) {
        query = { $or: [{ patientId: patient.patientId }, { patient: patient._id }] };
      }
    }

    const treatments = await Treatment.find(query).sort({ createdAt: -1 });
    return res.status(200).json(treatments);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  addTreatment, 
  getTreatments, 
  getTreatmentsByPatient 
};