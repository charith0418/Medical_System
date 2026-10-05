const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: true,
      default: "General",
    },
    phone: {
      type: String,
      default: "N/A",
    },
    nic: {
      type: String,
      default: "N/A",
    },
    medicalLicenseNo: {
      type: String,
      default: "N/A",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);