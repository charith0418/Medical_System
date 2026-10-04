const PatientProfile = require('../models/PatientProfile');
const Treatment = require('../models/Treatment');
const Prescription = require('../models/Prescription');

const getReports = async (req, res) => {
    try {
        // total patients
        const totalPatients = await PatientProfile.countDocuments();

        // patients registered this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const patientsThisMonth = await PatientProfile.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // treatments this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);
        const treatmentsThisWeek = await Treatment.countDocuments({
            createdAt: { $gte: startOfWeek }
        });

        // total prescriptions
        const totalPrescriptions = await Prescription.countDocuments();

        res.status(200).json({
            totalPatients,
            patientsThisMonth,
            treatmentsThisWeek,
            totalPrescriptions
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getReports };