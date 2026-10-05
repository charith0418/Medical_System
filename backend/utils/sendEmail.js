require('dotenv').config();
const nodemailer = require('nodemailer');

// 1. Initialize Resend (HTTPS Port 443 - Never blocked by Render)
let resend = null;
if (process.env.RESEND_API_KEY) {
    try {
        const { Resend } = require('resend');
        resend = new Resend(process.env.RESEND_API_KEY);
    } catch (e) {
        console.warn("⚠ [RESEND NOTICE] 'resend' package not found. Run 'npm install resend'.");
    }
}

// 2. Initialize Nodemailer (Fallback for local development)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
});

// Default sender address for Resend free tier
const SENDER_EMAIL = process.env.EMAIL_FROM || 'Medicare Health <onboarding@resend.dev>';

/**
 * 1. Sends welcome onboarding email
 */
const sendWelcomeEmail = async (to, fullName, patientId) => {
    const clientBaseUrl = process.env.CLIENT_URL || 'https://medical-system-5fwx.onrender.com';
    const portalLoginUrl = `${clientBaseUrl.replace(/\/+$/, '')}/login?email=${encodeURIComponent(to)}`;

    const htmlContent = `
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
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
                    Medicare Health Network &bull; Automated Registration Notice
                </p>
            </div>
        </div>
    `;

    // A. Send via Resend (HTTPS)
    if (resend) {
        try {
            const { data, error } = await resend.emails.send({
                from: SENDER_EMAIL,
                to: [to],
                subject: 'Medicare Health Network | Registration Successful',
                html: htmlContent,
            });

            if (error) {
                console.error("❌ [RESEND ERROR] Welcome email dispatch failed:", error);
                return null;
            }

            console.log(`✉ [RESEND SUCCESS] Welcome email dispatched via HTTPS to ${to}. ID: ${data.id}`);
            return data;
        } catch (err) {
            console.error("❌ [RESEND EXCEPTION]:", err.message);
        }
    }

    // B. Fallback to Nodemailer SMTP
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const info = await transporter.sendMail({
                from: `"Medicare Health System" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: 'Medicare Health Network | Registration Successful',
                html: htmlContent,
            });
            console.log(`✉ [SMTP SUCCESS] Welcome email delivered to ${to}. MessageId: ${info.messageId}`);
            return info;
        } catch (smtpErr) {
            console.error("❌ [SMTP ERROR] Welcome email dispatch failed:", smtpErr.message);
        }
    }

    console.warn("⚠ [EMAIL NOTICE] Neither Resend nor valid SMTP credentials available. Skipped email.");
    return null;
};

/**
 * 2. Sends secure password reset link to user email
 */
const sendPasswordResetEmail = async (to, resetToken, clientBaseUrl) => {
    const baseUrl = clientBaseUrl || process.env.CLIENT_URL || 'https://medical-system-5fwx.onrender.com';
    const resetPasswordUrl = `${baseUrl.replace(/\/+$/, '')}/reset-password/${resetToken}`;

    // Always log the link to Render terminal as a guaranteed backup
    console.log("\n=======================================================");
    console.log("🔑 [PASSWORD RESET LINK GENERATED]");
    console.log(`🔗 Click/Copy Link: ${resetPasswordUrl}`);
    console.log("=======================================================\n");

    const htmlContent = `
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
    `;

    // A. Send via Resend (HTTPS)
    if (resend) {
        try {
            const { data, error } = await resend.emails.send({
                from: SENDER_EMAIL,
                to: [to],
                subject: 'Medicare Hospital | Password Reset Authorization Link',
                html: htmlContent,
            });

            if (error) {
                console.error("❌ [RESEND ERROR] Password reset dispatch failed:", error);
                return { success: false, url: resetPasswordUrl };
            }

            console.log(`✉️ [RESEND SUCCESS] Password reset email dispatched to ${to}:`, data.id);
            return { success: true, messageId: data.id, url: resetPasswordUrl };
        } catch (err) {
            console.error("❌ [RESEND EXCEPTION]:", err.message);
        }
    }

    // B. Fallback to Nodemailer SMTP
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const info = await transporter.sendMail({
                from: `"Medicare Security Gateway" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: 'Medicare Hospital | Password Reset Authorization Link',
                html: htmlContent,
            });
            console.log(`✉️ [SMTP SUCCESS] Password reset email dispatched to ${to}:`, info.messageId);
            return { success: true, messageId: info.messageId, url: resetPasswordUrl };
        } catch (smtpErr) {
            console.warn("⚠️ SMTP Dispatch Notice (ISP/Cloud Port Block):", smtpErr.message);
        }
    }

    return { success: false, url: resetPasswordUrl };
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
};