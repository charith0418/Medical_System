const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Sub-schema for individual visit logs
const VisitHistorySchema = new mongoose.Schema({
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  doctorId: { type: String, default: "" },
  doctorName: { type: String, default: "Dr. Asela Perera" },
  diagnosis: { type: String, default: "General Visit" },
  notes: { type: String, default: "" }
}, { _id: true });

// Sub-schema for individual prescriptions
const PrescriptionItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, default: "As directed" },
  duration: { type: String, default: "N/A" },
  prescribedBy: { type: String, default: "Dr. Medical Officer" },
  date: { type: String, default: () => new Date().toISOString().split("T")[0] }
}, { _id: true });

const PatientProfileSchema = new mongoose.Schema({
  patientId: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  nic: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  dob: { 
    type: Date, 
    required: true 
  },
  gender: { 
    type: String, 
    required: true, 
    enum: ['Male', 'Female', 'Other'] 
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  address: { 
    type: String, 
    required: true, 
    trim: true 
  },
  bloodGroup: { 
    type: String, 
    required: true, 
    default: 'O+' 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: false 
  },
  guardianName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  guardianPhone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  qrCodeData: { 
    type: String, 
    required: true 
  },

  // Sub-documents for patient visit medical archive & medication logs
  history: [VisitHistorySchema],
  prescriptions: [PrescriptionItemSchema],
  allergies: [{ type: String, trim: true }]

}, { 
  timestamps: true 
});

// Password Hash Middleware
PatientProfileSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);