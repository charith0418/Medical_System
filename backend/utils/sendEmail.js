require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns');

// Prioritize IPv4 lookups to prevent cloud container IPv6 network unreachability
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const portNumber = Number(process.env.EMAIL_PORT) || 465;
const isSecure = portNumber === 465;

const transporter = nodemailer.createTransport({
    // Using service: 'gmail' natively applies Gmail's required socket & SSL settings
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: portNumber,
    secure: isSecure, // Automatically true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    // Increased timeouts to accommodate cloud latency spikes
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 20000,
    socketTimeout: 20000,
});

/**
 * Sends welcome onboarding email
 */
const sendWelcomeEmail = async (to, fullName, patientId) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️️ [SMTP NOTICE] EMAIL_USER or EMAIL_PASS missing. Skipped sending welcome email.");
            return null;
        }

        const clientBaseUrl = process.env.CLIENT_URL || 'https://medical-system-5fwx.onrender.com';
        const portalLoginUrl = `${clientBaseUrl}/login?email=${encodeURIComponent(to)}`;

        const mailOptions = {
            from: `"Medicare Health System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Medicare Health Network | Registration Successful',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f8fafc; color: #1e293b;">
                    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
                        <h2 style="color: #0f172a; margin-top: 0;">Welcome to Medicare, ${fullName}!</h2>
                        <p style="font-size: 15px; color: #475569;">
                            Your hospital patient profile has been registered successfully.
                        </p>
                        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; margin: 20px 0;">
                            <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Your Assigned Patient ID</span>
                            <span style="font-size: 20px; font-weight: bold; color: #0f172a; font-family: monospace;">${patientId}</span>
                        </div>
                        <div style="text-align: center; margin: 28px 0;">
                            <a href="${portalLoginUrl}" style="background-color: #078a72; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block;">
                                Access Patient Portal
                            </a>
                        </div>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️️ [SMTP SUCCESS] Welcome email delivered to ${to}. MessageId: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error("❌ [SMTP ERROR] Welcome email dispatch failed:", err.message);
        return null;
    }
};

/**
 * Sends secure password reset link to user email
 */
const sendPasswordResetEmail = async (to, resetToken, clientBaseUrl) => {
    const baseUrl = clientBaseUrl || process.env.CLIENT_URL || 'https://medical-system-5fwx.onrender.com';
    const resetPasswordUrl = `${baseUrl}/reset-password/${resetToken}`;

    console.log("\n=======================================================");
    console.log("🔑 [PASSWORD RESET LINK GENERATED]");
    console.log(`🔗 Click/Copy Link: ${resetPasswordUrl}`);
    console.log("=======================================================\n");

    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️ Missing EMAIL_USER or EMAIL_PASS. Email live delivery skipped.");
            return { success: false, url: resetPasswordUrl };
        }

        const mailOptions = {
            from: `"Medicare Security Gateway" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Medicare Hospital | Password Reset Authorization Link',
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; padding: 32px;">
                        <h2 style="color: #0f172a; margin-top: 0;">Medicare Health System</h2>
                        <p style="font-size: 15px; color: #475569;">
                            We received a request to reset access credentials for account: <strong>${to}</strong>
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetPasswordUrl}" 
                               style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block;">
                               Reset My Password
                            </a>
                        </div>
                        <p style="font-size: 12px; color: #64748b;">
                            This link is valid for 30 minutes. If the button doesn't work, copy and paste this URL:<br />
                            <a href="${resetPasswordUrl}" style="color: #0284c7;">${resetPasswordUrl}</a>
                        </p>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Password reset email dispatched to ${to}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.warn("⚠️ SMTP Dispatch Notice (ISP Port Block):", error.message);
        return { success: false, url: resetPasswordUrl };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
};