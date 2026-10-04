const Counter = require('../models/Counter');

const generatePatientId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: 'patientId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const padded = String(counter.seq).padStart(5, '0');
    return `P${padded}`;
};

module.exports = generatePatientId;