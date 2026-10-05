const crypto = require('crypto');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

// ==========================================
// 1. REGISTER PATIENT / USER
// ==========================================
const registerUser = async (req, res) => {
  let savedUser = null;
  let savedProfile = null;

  try {
    const {
      email,
      password,
      role = 'Patient',
      fullName,
      name,
      patientName,
      nic,
      nicNumber,
      dob,
      dateOfBirth,
      birthDate,
      gender,
      phone,
      phoneNumber,
      contactNo,
      contactNumber,
      mobile,
      bloodGroup,
      address,
      guardianName,
      guardianPhone,
      patientId,
      qrCodeData,
    } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Normalize Role to match Mongoose enum ('Patient', 'Doctor', 'Staff', 'Admin')
    const rawRole = String(role).trim().toLowerCase();
    const normalizedRole =
      rawRole === 'doctor' ? 'Doctor' :
      rawRole === 'staff' ? 'Staff' :
      rawRole === 'admin' ? 'Admin' : 'Patient';

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account associated with ${cleanEmail} already exists.`,
      });
    }

    const resolvedName = (fullName || name || patientName || 'Registered Patient').trim();
    const resolvedNic = (nic || nicNumber || '').trim();
    const resolvedPhone = (phone || phoneNumber || contactNo || contactNumber || mobile || '').trim();

    if (normalizedRole === 'Patient') {
      if (!resolvedName) {
        return res.status(400).json({
          success: false,
          message: 'Full Name is required for patient profile registration.',
        });
      }

      if (!resolvedNic) {
        return res.status(400).json({
          success: false,
          message: 'National Identity Card (NIC) number is required.',
        });
      }

      if (!resolvedPhone) {
        return res.status(400).json({
          success: false,
          message: 'Contact phone number is required.',
        });
      }

      const existingProfile = await PatientProfile.findOne({
        $or: [{ nic: resolvedNic }, { email: cleanEmail }],
      });

      if (existingProfile) {
        const duplicateField = existingProfile.nic === resolvedNic ? `NIC (${resolvedNic})` : `Email (${cleanEmail})`;
        return res.status(400).json({
          success: false,
          message: `A medical profile with this ${duplicateField} already exists in the hospital registry.`,
        });
      }
    }

    const finalPassword =
      password && String(password).trim().length >= 6
        ? String(password).trim()
        : (resolvedNic || 'Medicare@123');

    savedUser = await User.create({
      email: cleanEmail,
      password: finalPassword,
      role: normalizedRole,
    });

    if (normalizedRole === 'Patient') {
      const rawDob = dob || dateOfBirth || birthDate;
      const parsedDob = rawDob ? new Date(rawDob) : new Date('2000-01-01');
      const validDob = isNaN(parsedDob.getTime()) ? new Date('2000-01-01') : parsedDob;

      const generatedId = patientId || `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
      const qrData = qrCodeData || `MEDNET-CARD-NODE-${generatedId}-${resolvedNic}`;

      savedProfile = await PatientProfile.create({
        user: savedUser._id,
        patientId: generatedId,
        fullName: resolvedName,
        nic: resolvedNic,
        dob: validDob,
        gender: gender || 'Other',
        phone: resolvedPhone,
        bloodGroup: bloodGroup || 'N/A',
        address: address ? address.trim() : 'N/A',
        email: cleanEmail,
        guardianName: guardianName ? guardianName.trim() : 'N/A',
        guardianPhone: guardianPhone ? guardianPhone.trim() : 'N/A',
        qrCodeData: qrData,
      });

      sendWelcomeEmail(cleanEmail, resolvedName, generatedId).catch((err) => {
        console.warn('Welcome notification skipped:', err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully in the Medicare system.',
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
      },
      patientProfile: savedProfile,
    });
  } catch (error) {
    console.error('Registration Server Error:', error);

    if (savedProfile?._id) await PatientProfile.findByIdAndDelete(savedProfile._id).catch(() => {});
    if (savedUser?._id) await User.findByIdAndDelete(savedUser._id).catch(() => {});

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || 'record';
      return res.status(400).json({
        success: false,
        message: `Duplicate entry: A patient with this ${duplicateField} is already registered.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal database error during patient registration.',
    });
  }
};

// ==========================================
// 2. USER LOGIN
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password, role, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Case-insensitive role comparison
    if (role && user.role.toLowerCase() !== String(role).trim().toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Your account is registered as '${user.role}', not '${role}'.`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(res, user._id, user.role, rememberMe);

    return res.status(200).json({
      success: true,
      _id: user._id,
      email: user.email,
      role: user.role,
      token: token,
      message: 'Authentication successful.',
    });
  } catch (error) {
    console.error('Login Server Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login authentication.',
    });
  }
};

// ==========================================
// 3. FORGOT PASSWORD
// ==========================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered account email.',
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No healthcare account found with this email address.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: tokenExpires,
    });

    const clientOrigin = req.headers.origin || req.get('origin') || process.env.CLIENT_URL || 'http://localhost:5173';
    await sendPasswordResetEmail(cleanEmail, resetToken, clientOrigin);

    return res.status(200).json({
      success: true,
      message: `A password reset link has been dispatched to ${cleanEmail}.`,
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing password reset request.',
      error: error.message,
    });
  }
};

// ==========================================
// 4. RESET PASSWORD WITH TOKEN
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.',
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset authorization link is invalid or has expired.',
      });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new credentials.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting password.',
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};