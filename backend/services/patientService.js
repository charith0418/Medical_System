const PatientProfile = require('../models/PatientProfile');
const Prescription = require('../models/Prescription'); 
const Treatment = require('../models/Treatment');

const getPatientDashboardData = async (userId, userEmail) => {
    const profile = await PatientProfile.findOne({ user: userId });

    if (!profile) {
        throw new Error('Patient profile not found'); 
    }

    const latestPrescription = await Prescription.findOne({ patient: profile._id }).sort({ dateIssued: -1 });
    const latestPrescriptionData = latestPrescription ? latestPrescription.medications : [];

    return {
        healthCard: {
            fullName: profile.fullName,
            patientId: profile.patientId,
            bloodGroup: profile.bloodGroup,
            dob: profile.dob,
            gender: profile.gender,
            phone: profile.phone,
            qrCodeData: profile.qrCodeData
        },
        personalInformation: {
            patientId: profile.patientId,
            phone: profile.phone,
            email: userEmail, 
            address: profile.address,
            gender: profile.gender,
            dob: profile.dob
        },
        medicalHistory: profile.medicalHistory,
        latestPrescriptions: latestPrescriptionData,
        emergencyContact: profile.emergencyContact
    };
};

const getDetailedMedicalHistory = async (userId) => {
    const profile = await PatientProfile.findOne({ user: userId });

    if (!profile) {
        throw new Error('Patient profile not found');
    }

    let currentAge = 'N/A';
    if (profile.dob) {
        const diffMs = Date.now() - profile.dob.getTime();
        const ageDate = new Date(diffMs); 
        currentAge = Math.abs(ageDate.getUTCFullYear() - 1970);
    }
    return {
        headerInfo: {
            fullName: profile.fullName,
            age: `${currentAge} Years`,
            bloodGroup: profile.bloodGroup,
            dob: profile.dob
        },
        history: profile.medicalHistory || {
            diagnoses: [],
            surgeries: [],
            allergies: [],
            vaccinations: []
        }
    };
};


const getPrescriptionDetails = async (userId) => {
    const profile = await PatientProfile.findOne({ user: userId });

    if (!profile) {
        throw new Error('Patient profile not found');
    }

    
    const rawPrescriptions = await Prescription.find({ patient: profile._id }).sort({ dateIssued: -1 }).lean();
    const allTreatments = await Treatment.find({ patient: profile._id }).lean();

    const sortedPrescriptions = rawPrescriptions.map(rx => {
        const matchingTreatment = allTreatments.find(t => t.prescriptionId === rx.prescriptionId);
        return {
            ...rx,
            instructions: matchingTreatment ? matchingTreatment.instructions : "No specific instructions provided."
        };
    });


    let latestPrescription = null;
    let previousPrescriptions = [];

    if (sortedPrescriptions.length > 0) {
        latestPrescription = sortedPrescriptions[0]; 
        previousPrescriptions = sortedPrescriptions.slice(1); 
    }

    return {
        patientName: profile.fullName, 
        latestPrescription: latestPrescription,
        previousPrescriptions: previousPrescriptions,
        allPrescriptions: sortedPrescriptions 
    };
};


module.exports = {
    getPatientDashboardData,
    getDetailedMedicalHistory,
    getPrescriptionDetails
};