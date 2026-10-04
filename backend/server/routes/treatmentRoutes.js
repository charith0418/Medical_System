const express = require('express');
const router = express.Router();
const { addTreatment, getTreatments, getTreatmentsByPatient} = require('../controllers/treatmentController');

router.post('/', addTreatment);
router.get('/', getTreatments);
router.get('/:patientId', getTreatmentsByPatient);


module.exports = router;