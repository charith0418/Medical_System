const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    staffId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    nic: { type: String, required: true, unique: true },
    role: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);