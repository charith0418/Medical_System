const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');
const PatientProfile = require('../models/PatientProfile');

// POST /api/prescriptions
exports.addPrescription = async (req, res) => {
  try {
    const { 
      patientId,      // PAT-XXXXXX string OR MongoDB _id sent from frontend
      doctorName, 
      hospital, 
      diagnosis, 
      medications, 
      medicines       // Fallback payload key
    } = req.body;

    // 1. Resolve Patient MongoDB _id
    let patientObjId = null;

    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      patientObjId = patientId;
    } else if (patientId && typeof patientId === 'string' && patientId.startsWith('PAT-')) {
      const patient = await PatientProfile.findOne({ patientId: patientId });
      if (patient) {
        patientObjId = patient._id;
      }
    }

    if (!patientObjId) {
      return res.status(400).json({
        message: "Invalid or missing patient identifier. Could not map to a patient profile."
      });
    }

    // 2. Auto-generate prescriptionId (e.g., RX-749201)
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const generatedRxId = `RX-${randomHex}`;

    // 3. Normalise medication items
    const rawList = medications || medicines || [];
    const formattedMedications = rawList.map(item => ({
      name: item.name || item.medicineName || item.drug || "Prescribed Medicine",
      dosage: item.dosage || "",
      frequency: item.frequency || "",
      duration: item.duration || ""
    }));

    // 4. Build and save document
    const newPrescription = new Prescription({
      patient: patientObjId,
      prescriptionId: generatedRxId,
      doctorName: doctorName || "Unassigned Doctor",
      hospital: hospital || "Medicare General Hospital",
      diagnosis: diagnosis || "General Consultation",
      medications: formattedMedications
    });

    const savedPrescription = await newPrescription.save();

    return res.status(201).json({
      success: true,
      message: "Prescription recorded successfully",
      data: savedPrescription
    });

  } catch (error) {
    console.error("Prescription Creation Error:", error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        message: "Validation Error",
        errors: messages
      });
    }

    return res.status(500).json({
      message: "Failed to record prescription in database",
      error: error.message
    });
  }
};

// GET /api/prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({})
      .populate('patient', 'fullName patientId phone bloodGroup age gender')
      .sort({ createdAt: -1 });

    return res.status(200).json(prescriptions);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve prescriptions",
      error: error.message
    });
  }
};

// GET /api/prescriptions/patient/:patientId OR /api/prescriptions/:patientId
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(patientId)) {
      query = { patient: patientId };
    } else if (patientId && patientId.startsWith('PAT-')) {
      const patient = await PatientProfile.findOne({ patientId: patientId });
      if (!patient) {
        return res.status(200).json([]);
      }
      query = { patient: patient._id };
    } else {
      query = { prescriptionId: patientId };
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'fullName patientId phone bloodGroup age gender')
      .sort({ createdAt: -1 });

    return res.status(200).json(prescriptions);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve patient prescriptions",
      error: error.message
    });
  }
};