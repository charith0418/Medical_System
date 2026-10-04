const Medicine = require('../models/Medicine');
const generateMedicine = require('../utils/generateMedicine');

// 1. POST /api/medicines
const addMedicine = async (req, res) => {
    try {
        const { name, category, quantity, unitForm, storageLocation, reorderLevel } = req.body;
        
        // Await the asynchronous code generator utility
        const medicineCode = await generateMedicine();

        // Map the payload to the exact schema properties
        const newMedicine = await Medicine.create({
            medicineCode,
            medicineName: name,
            categoryClass: category,
            unitForm: unitForm || 'Tablets',
            quantity: parseInt(quantity, 10) || 0,
            storageLocation: storageLocation || 'Main Pharmacy Store',
            reorderLevel: parseInt(reorderLevel, 10) || 20
        });

        res.status(201).json({ 
            message: 'Medicine added successfully', 
            medicine: newMedicine 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding medicine', error: error.message });
    }
};

// 2. GET /api/medicines
const getAllMedicines = async (req, res) => {
    try {
        // Sorted by newest additions first
        const medicines = await Medicine.find({}).sort({ createdAt: -1 });
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching medicines', error: error.message });
    }
};

// 3. GET /api/medicines/search
const searchMedicines = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ message: 'Search query parameter (q) is required' });
        }

        // Updated queries to target medicineName and medicineCode schema properties
        const medicines = await Medicine.find({
            $or: [
                { medicineName: { $regex: q, $options: 'i' } },
                { medicineCode: { $regex: q, $options: 'i' } },
                { categoryClass: { $regex: q, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Error searching medicines', error: error.message });
    }
};

module.exports = {
    addMedicine,
    getAllMedicines,
    searchMedicines
};