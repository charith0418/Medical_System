const mongoose = require('mongoose');

const MedicineMasterSchema = new mongoose.Schema({
  medicineCode: {
    type: String,
    required: [true, 'Medicine code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
    unique: true,
    trim: true
  },
  categoryClass: {
    type: String,
    required: [true, 'Category class is required'],
    trim: true,
    enum: [
      'Analgesic',
      'Analgesic (Pain Relief)', 
      'Antibiotic', 
      'Antihistamine',
      'Antihistamine (Allergy)', 
      'Antidiabetic', 
      'Antihypertensive',
      'Antihypertensive (BP)', 
      'NSAID',
      'NSAID (Anti-inflammatory)', 
      'Antipyretic',
      'Antipyretic (Fever)', 
      'Vitamins & Minerals', 
      'General Medical Item'
    ]
  },
  unitForm: {
    type: String,
    required: [true, 'Unit form is required'],
    trim: true,
    enum: ['Tablets', 'Capsules', 'Bottles', 'Ampoules', 'Ointments', 'Injections', 'Syrup']
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicineMaster', MedicineMasterSchema);