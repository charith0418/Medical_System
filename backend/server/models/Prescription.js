const mongoose = require('mongoose');

const medicationItemSchema = new mongoose.Schema({
    medicineName: { type: String },
    name: { type: String }, // Fallback alias
    dosage: { type: String },
    dose: { type: String },   // Fallback alias
    amount: { type: String }, // Fallback alias
    frequency: { type: String },
    duration: { type: String }
}, { _id: true });

const prescriptionSchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PatientProfile', 
        required: true 
    },
    prescriptionId: { type: String, required: true, unique: true }, 
    doctorName: { type: String },     
    hospital: { type: String },       
    diagnosis: { type: String },      
    dateIssued: { type: Date, default: Date.now },
    
    // Array of medication objects
    medications: [medicationItemSchema],
    
    // Alias array for backward compatibility with components looking for "medicines"
    medicines: [medicationItemSchema]
}, { timestamps: true });

// Pre-save middleware to synchronize 'medications' and 'medicines' fields
prescriptionSchema.pre('save', function (next) {
    if (this.medications && this.medications.length > 0) {
        // Ensure medicineName and name are normalized across all items
        this.medications.forEach(item => {
            if (!item.medicineName && item.name) item.medicineName = item.name;
            if (!item.name && item.medicineName) item.name = item.medicineName;
            if (!item.dosage && item.dose) item.dosage = item.dose;
            if (!item.dose && item.dosage) item.dose = item.dosage;
        });
        this.medicines = this.medications;
    } else if (this.medicines && this.medicines.length > 0) {
        this.medicines.forEach(item => {
            if (!item.medicineName && item.name) item.medicineName = item.name;
            if (!item.name && item.medicineName) item.name = item.medicineName;
        });
        this.medications = this.medicines;
    }
    next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);