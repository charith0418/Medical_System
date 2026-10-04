const express = require('express');
const router = express.Router();
const { 
    addPrescription, 
    getPrescriptions, 
    getPrescriptionsByPatient 
} = require('../controllers/prescriptionController');

// POST /api/prescriptions -> Add new prescription
router.post('/', addPrescription);

// GET /api/prescriptions -> Get all prescriptions
router.get('/', getPrescriptions);

// GET /api/prescriptions/patient/:patientId -> Fetch by patient ID
router.get('/patient/:patientId', getPrescriptionsByPatient);

// GET /api/prescriptions/:patientId -> Fallback route for direct ID lookups
router.get('/:patientId', getPrescriptionsByPatient);

module.exports = router;