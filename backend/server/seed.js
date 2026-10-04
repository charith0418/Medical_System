const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const PatientProfile = require('./models/PatientProfile');

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_system';

async function seedDB() {
  try {
    console.log(`Connecting to: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for safe seeding...');

    const rawPassword = 'password123';

    // 1. SEED ADMIN (Only if admin does not exist)
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        email: 'admin@example.com',
        password: rawPassword,
        role: 'Admin'
      });
      await adminUser.save();
      console.log('🎉 Created Admin User login credentials.');
    }

    // 2. SEED PATIENT (Only if sample patient does not exist)
    const patientEmail = 'patient@example.com';
    const patientNic = '199512345678';

    const existingPatient = await User.findOne({ email: patientEmail });
    if (!existingPatient) {
      const patientUser = new User({
        email: patientEmail.toLowerCase(),
        password: rawPassword,
        role: 'Patient'
      });
      const savedPatientUser = await patientUser.save();

      const generatedId = 'PAT-582194';
      const qrData = `MEDNET-VALIDATION-NODE-${generatedId}-${patientNic}`;

      await PatientProfile.create({
        user: savedPatientUser._id,
        patientId: generatedId,
        fullName: 'John Doe',
        nic: patientNic,
        dob: new Date('1995-05-15'),
        gender: 'Male',
        phone: '0712345678',
        bloodGroup: 'O+',
        address: '123 Main Street, Colombo',
        email: patientEmail.toLowerCase(),
        password: rawPassword,
        guardianName: 'Jane Doe',
        guardianPhone: '0771234567',
        qrCodeData: qrData
      });
      console.log('🎉 Created Patient Profile linked to Patient User.');
    }

    // 3. SEED DOCTOR (Only if doctor does not exist)
    const existingDoctor = await User.findOne({ email: 'doctor@example.com' });
    if (!existingDoctor) {
      const doctorUser = new User({
        email: 'doctor@example.com',
        password: rawPassword,
        role: 'Doctor'
      });
      await doctorUser.save();
      console.log('🎉 Created Doctor User login credentials.');
    }

    // 4. SEED STAFF (Only if staff does not exist)
    const existingStaff = await User.findOne({ email: 'staff@example.com' });
    if (!existingStaff) {
      const staffUser = new User({
        email: 'staff@example.com',
        password: rawPassword,
        role: 'Staff'
      });
      await staffUser.save();
      console.log('🎉 Created Staff User login credentials.');
    }

    console.log('\n🌟 Database check completed safely without wiping existing records!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDB();