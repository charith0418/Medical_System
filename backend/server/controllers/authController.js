const crypto = require('crypto');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

// ==========================================
// 1. REGISTER PATIENT / USER
// ==========================================
// @desc    Register a new user and create medical profile
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    let savedUser = null;
    let savedProfile = null;

    try {
        console.log("\n=========================================");
        console.log("📥 [AUTH REGISTER] Incoming Payload:", JSON.stringify(req.body, null, 2));

        const {
            email,
            password,
            role = 'Patient',
            // Name variations
            fullName,
            name,
            patientName,
            // NIC variations
            nic,
            nicNumber,
            // DOB variations
            dob,
            dateOfBirth,
            birthDate,
            // Demographics & Contacts
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
            qrCodeData
        } = req.body;

        // 1. Validate Email
        if (!email || !String(email).trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address.' 
            });
        }

        const cleanEmail = String(email).toLowerCase().trim();

        // 2. Normalize Role to match Mongoose enum ('Patient', 'Doctor', 'Staff', 'Admin')
        const rawRole = String(role).trim().toLowerCase();
        const normalizedRole = 
            rawRole === 'doctor' ? 'Doctor' :
            rawRole === 'staff' ? 'Staff' :
            rawRole === 'admin' ? 'Admin' : 'Patient';

        // 3. Check for existing User in database
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: `An account associated with ${cleanEmail} already exists.` 
            });
        }

        // 4. Resolve field mappings
        const resolvedName = (fullName || name || patientName || 'Registered Patient').trim();
        const resolvedNic = (nic || nicNumber || '').trim();
        const resolvedPhone = (phone || phoneNumber || contactNo || contactNumber || mobile || '').trim();

        // 5. Patient-specific validations
        if (normalizedRole === 'Patient') {
            if (!resolvedName) {
                return res.status(400).json({
                    success: false,
                    message: 'Full Name is required for patient profile registration.'
                });
            }

            if (!resolvedNic) {
                return res.status(400).json({
                    success: false,
                    message: 'National Identity Card (NIC) number is required.'
                });
            }

            if (!resolvedPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Contact phone number is required.'
                });
            }

            // Check duplicate NIC or Email in PatientProfile collection
            const existingProfile = await PatientProfile.findOne({
                $or: [{ nic: resolvedNic }, { email: cleanEmail }]
            });

            if (existingProfile) {
                const duplicateField = existingProfile.nic === resolvedNic ? `NIC (${resolvedNic})` : `Email (${cleanEmail})`;
                return res.status(400).json({
                    success: false,
                    message: `A medical profile with this ${duplicateField} already exists in the hospital registry.`
                });
            }
        }

        // 6. Provide a fallback password if the frontend registration form omitted it
        const finalPassword = (password && String(password).trim().length >= 6)
            ? String(password).trim()
            : (resolvedNic || 'Medicare@123');

        // 7. Create User Account
        savedUser = await User.create({
            email: cleanEmail,
            password: finalPassword,
            role: normalizedRole
        });

        // 8. Create Patient Profile
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
                qrCodeData: qrData
            });

            console.log(`✅ Patient Profile Created: ID [${generatedId}] for [${cleanEmail}]`);

            // Non-blocking welcome email dispatch
            sendWelcomeEmail(cleanEmail, resolvedName, generatedId).catch((err) => {
                console.warn("⚠️ Welcome notification skipped:", err.message);
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Patient registered successfully in the Medicare system.',
            user: {
                id: savedUser._id,
                email: savedUser.email,
                role: savedUser.role
            },
            patientProfile: savedProfile
        });

    } catch (error) {
        console.error("❌ Registration Server Error:", error);

        // Rollback partial documents if an error happened midway
        if (savedProfile?._id) await PatientProfile.findByIdAndDelete(savedProfile._id).catch(() => {});
        if (savedUser?._id) await User.findByIdAndDelete(savedUser._id).catch(() => {});

        // Handle MongoDB E11000 Duplicate Key Error cleanly
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0] || 'record';
            return res.status(400).json({
                success: false,
                message: `Duplicate entry: A patient with this ${duplicateField} is already registered.`
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Internal database error during patient registration.'
        });
    }
};

// ==========================================
// 2. USER LOGIN
// ==========================================
// @desc    Authenticate user & issue JWT token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password, role, rememberMe } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide both email and password.' 
            });
        }

        const cleanEmail = String(email).toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password.' 
            });
        }

        if (role && user.role !== role) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Your account is not registered under the ${role} portal.` 
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password.' 
            });
        }

        const token = generateToken(res, user._id, user.role, rememberMe);

        return res.status(200).json({
            success: true,
            _id: user._id,
            email: user.email,
            role: user.role,
            token: token,
            message: 'Authentication successful.'
        });

    } catch (error) {
        console.error("❌ Login Server Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during login authentication.' 
        });
    }
};

// ==========================================
// 3. FORGOT PASSWORD (EMAIL LINK FLOW)
// ==========================================
// @desc    Generate password reset token & dispatch authorization link
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide your registered account email.' 
            });
        }

        const cleanEmail = String(email).toLowerCase().trim();

        // Find user
        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'No healthcare account found with this email address.' 
            });
        }

        // Generate 32-byte secure token (valid for 30 minutes)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 30 * 60 * 1000);

        // Update token fields directly on user document
        await User.findByIdAndUpdate(user._id, {
            passwordResetToken: resetToken,
            passwordResetExpires: tokenExpires,
        });

        // Determine client origin
        const clientOrigin = req.headers.origin || req.get('origin') || process.env.CLIENT_URL || 'http://localhost:5174';

        // Dispatch Email with Fallback Logging
        await sendPasswordResetEmail(cleanEmail, resetToken, clientOrigin);

        return res.status(200).json({
            success: true,
            message: `A password reset link has been dispatched to ${cleanEmail}.`
        });

    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error processing password reset request.',
            error: error.message 
        });
    }
};

// ==========================================
// 4. RESET PASSWORD WITH TOKEN
// ==========================================
// @desc    Verify reset token & update password
// @route   POST /api/auth/reset-password/:token
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

        // Locate user with matching, unexpired token
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

        // Update password and clear reset token fields
        user.password = password;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save(); // Triggers bcrypt pre-save hash

        console.log(`🔐 Password successfully updated for user: [${user.email}]`);

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully! You can now log in with your new credentials.',
        });

    } catch (error) {
        console.error("❌ Reset Password Error:", error);
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
    resetPassword
};