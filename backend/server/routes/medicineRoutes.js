const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const MedicineMaster = require('../models/MedicineMaster');
const generateMedicine = require('../utils/generateMedicine');

// 1. GET: Fetch all verified drug names for the frontend searchable dropdown
router.get('/master-list', async (req, res) => {
  try {
    const list = await MedicineMaster.find().sort({ medicineName: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET: Fetch active stock levels with full name details populated
router.get('/', async (req, res) => {
  try {
    const stock = await Medicine.find()
      .populate('medicineMasterId')
      .sort({ createdAt: -1 });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET: Query specific inventory allocations by location matching
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query parameter (q) is required' });
    }

    const stock = await Medicine.find({
      storageLocation: { $regex: q, $options: 'i' }
    })
    .populate('medicineMasterId')
    .sort({ createdAt: -1 });
    
    res.status(200).json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. POST: Save updated stock layout entry (Aligns with React component output)
router.post('/', async (req, res) => {
  try {
    const { medicineMasterId, quantity, storageLocation, reorderLevel } = req.body;

    // Optional: Creates a code sequence fallback tracking metric if required
    let medicineCode;
    try {
      medicineCode = await generateMedicine();
    } catch (e) {
      medicineCode = 'PENDING-' + Date.now();
    }

    // Initialize document instance using clean structural casting properties
    const newStock = new Medicine({ 
      medicineMasterId, 
      quantity: parseInt(quantity, 10) || 0, 
      storageLocation: storageLocation || 'Pharmacy Main Shelf A',
      reorderLevel: parseInt(reorderLevel, 10) || 20
    });

    const savedStock = await newStock.save();
    const populated = await savedStock.populate('medicineMasterId');
    
    res.status(201).json({ 
      message: 'Medicine inventory asset logged successfully', 
      medicine: populated 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. DELETE: Drop a stock line item row from inventory management tracking
router.delete('/:id', async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: "Asset successfully dropped." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. DIAGNOSTIC ROUTE MATCH FALLBACK
router.use((req, res) => {
  res.status(404).json({
    error: "Route mismatch within medicine router context",
    resolvedUrl: req.originalUrl,
    advice: "Ensure the path matches exactly and no dynamic routers stole the request."
  });
});

module.exports = router;