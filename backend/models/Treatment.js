const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
    prescriptionId: { type: String, required: true }, 
    instructions: { type: String },  
    dateIssued: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Treatment', treatmentSchema);