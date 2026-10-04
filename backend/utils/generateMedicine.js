const Medicine = require('../models/Medicine');

/**
 * Generates a sequential unique medicine code based on current document count
 * @returns {Promise<string>} e.g., "MED-001", "MED-002"
 */
const generateMedicineCode = async () => {
    const count = await Medicine.countDocuments();
    const padded = String(count + 1).padStart(3, '0');
    return `MED-${padded}`;
};

module.exports = generateMedicineCode;