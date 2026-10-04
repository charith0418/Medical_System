const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');

// ================= DASHBOARD STATS =================
const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'Patient' });
    const totalDoctors = await Doctor.countDocuments();
    const totalStaff = await Staff.countDocuments();

    res.status(200).json({
      admin: { name: req.user?.name || 'Admin User' },
      stats: {
        patients: totalPatients,
        patientsGrowth: '+0%',
        doctors: totalDoctors,
        doctorsGrowth: '+0%',
        staff: totalStaff,
        staffGrowth: '+0%',
      },
      overview: [],
      activity: [
        { name: 'Patients', value: totalPatients },
        { name: 'Doctors', value: totalDoctors },
        { name: 'Staff', value: totalStaff },
      ],
      activityLogs: [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// ================= DOCTOR CONTROLLERS =================
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

const createDoctor = async (req, res) => {
  const { email, password, firstName, lastName, doctorId, phone, specialization, specialty, name } = req.body;
  let newUser = null;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const doctorName = name?.trim() || `${firstName || ''} ${lastName || ''}`.trim() || 'Dr. Unknown';
    const cleanDoctorId = doctorId?.trim() || `DOC/${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanSpecialty = specialization?.trim() || specialty?.trim() || 'General';

    // 1. Create User account for login
    newUser = await User.create({
      email: cleanEmail,
      password: password || 'Doctor@123456',
      role: 'Doctor',
      name: doctorName,
    });

    // 2. Create Doctor profile matching Doctor Schema
    const newDoctor = await Doctor.create({
      doctorId: cleanDoctorId,
      name: doctorName,
      email: cleanEmail,
      specialty: cleanSpecialty,
      phone: phone?.trim() || 'N/A',
    });

    return res.status(201).json({ message: 'Doctor created successfully', doctor: newDoctor });
  } catch (error) {
    if (newUser) await User.findByIdAndDelete(newUser._id);
    console.error('Error creating doctor:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `A record with this ${field} already exists.` });
    }

    return res.status(500).json({ message: error.message || 'Error creating doctor' });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { firstName, lastName, name, specialization, specialty } = req.body;
    const updateData = { ...req.body };

    if (specialization || specialty) {
      updateData.specialty = specialization || specialty;
    }

    const updatedName = name?.trim() || `${firstName || ''} ${lastName || ''}`.trim();
    if (updatedName) {
      updateData.name = updatedName;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (updatedDoctor?.email) {
      await User.findOneAndUpdate({ email: updatedDoctor.email }, { name: updatedDoctor.name });
    }

    res.status(200).json({ message: 'Doctor updated successfully', doctor: updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor', error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      await User.findOneAndDelete({ email: doctor.email });
      await Doctor.findByIdAndDelete(req.params.id);
    } else {
      await User.findByIdAndDelete(req.params.id);
    }
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor', error: error.message });
  }
};

// ================= STAFF CONTROLLERS =================
const getStaff = async (req, res) => {
  try {
    const staffMembers = await Staff.find().populate('user', '-password').sort({ createdAt: -1 });
    res.status(200).json(staffMembers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

const createStaff = async (req, res) => {
  const { email, password, firstName, lastName, name, phone, nic, role, staffId } = req.body;
  let newUser = null;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Name parsing fallback logic
    let cleanFirstName = firstName?.trim();
    let cleanLastName = lastName?.trim();
    if (!cleanFirstName && name) {
      const parts = name.trim().split(' ');
      cleanFirstName = parts[0] || 'Staff';
      cleanLastName = parts.slice(1).join(' ') || 'Member';
    }

    cleanFirstName = cleanFirstName || 'Staff';
    cleanLastName = cleanLastName || 'Member';

    const cleanStaffId = staffId?.trim() || `STF/${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanPhone = phone?.trim() || '0700000000';
    const cleanNic = nic?.trim() || `NIC-${Date.now()}`;
    const cleanRole = role?.trim() || 'Staff'; // Title like Nurse, Pharmacist, etc.

    // 1. Create User account with role set explicitly to 'Staff' to satisfy User schema enum
    newUser = await User.create({
      email: cleanEmail,
      password: password || 'Staff@123456',
      role: 'Staff', // FIXED: Pass base 'Staff' role for User authentication model
      name: `${cleanFirstName} ${cleanLastName}`,
    });

    // 2. Create Staff profile saving the specific job role
    const newStaff = await Staff.create({
      user: newUser._id,
      staffId: cleanStaffId,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      phone: cleanPhone,
      nic: cleanNic,
      role: cleanRole, // Job title (Nurse, Receptionist, etc.) stored in Staff model
    });

    return res.status(201).json({ message: 'Staff created successfully', staff: newStaff });
  } catch (error) {
    if (newUser) await User.findByIdAndDelete(newUser._id);
    console.error('Error creating staff:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `A record with this ${field} already exists.` });
    }

    return res.status(500).json({ message: error.message || 'Error creating staff' });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (updatedStaff?.user) {
      // FIXED: Ensure User model retains base 'Staff' role instead of title enum conflicts
      await User.findByIdAndUpdate(updatedStaff.user, {
        email: email || updatedStaff.email,
        role: 'Staff',
        name: `${firstName || updatedStaff.firstName} ${lastName || updatedStaff.lastName}`.trim(),
      });
    }

    res.status(200).json({ message: 'Staff updated successfully', staff: updatedStaff });
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff', error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (staff) {
      await User.findByIdAndDelete(staff.user);
      await Staff.findByIdAndDelete(req.params.id);
    } else {
      await User.findByIdAndDelete(req.params.id);
      await Staff.findOneAndDelete({ user: req.params.id });
    }
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getDoctors, createDoctor, updateDoctor, deleteDoctor,
  getStaff, createStaff, updateStaff, deleteStaff,
};