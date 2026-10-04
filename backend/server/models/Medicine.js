const mongoose = require('mongoose');

const InventoryStockSchema = new mongoose.Schema({
  medicineMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineMaster',
    required: [true, 'MedicineMaster ID reference is required']
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Stock levels cannot drop below zero']
  },
  storageLocation: {
    type: String,
    required: true,
    trim: true,
    enum: {
      values: [
        'Pharmacy Main Shelf A',
        'Pharmacy Main Shelf B',
        'Emergency Ward (ER)',
        'ICU Cabinet A',
        'General Store Room 1',
        'Cold Storage Fridge 1'
      ],
      message: '{VALUE} is not an authorized hospital storage location.'
    }
  },
  reorderLevel: {
    type: Number,
    default: 20
  }
}, { 
  timestamps: true,
  autoIndex: true 
});

const Medicine = mongoose.model('Medicine', InventoryStockSchema);

// Safe index handling after connection ready
mongoose.connection.once('open', () => {
  Medicine.cleanIndexes().catch(err => {
    console.log("Index cleanup notice:", err.message);
  });
});

module.exports = Medicine;