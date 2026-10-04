const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialty: { type: String, required: true },
  phone: { type: String },
});

module.exports = mongoose.model("Doctor", doctorSchema);