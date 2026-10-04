require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns');

// Prioritize IPv4 lookups to eliminate ENETUNREACH errors
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const ipv4Lookup = (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4, all: false }, callback);
};

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // false for port 587 (STARTTLS)
    requireTLS: true,
    lookup: ipv4Lookup,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 8000,
});

/**
 * Sends welcome onboarding email
 */
const sendWelcomeEmail = async (to, fullName, patientId) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

        const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const portalLoginUrl = `${clientBaseUrl}/login?email=${encodeURIComponent(to)}`;

        const mailOptions = {
            from: `"Medicare Health System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Medicare Health Network | Registration Successful',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome ${fullName}!</h2>
                    <p>Your Patient ID is: <strong>${patientId}</strong></p>
                    <a href="${portalLoginUrl}">Login to Patient Portal</a>
                </div>
            `,
        };

        return await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error("⚠️️ Welcome email skipped:", err.message);
        return null;
    }
};

/**
 * Sends secure password reset link to user email
 */
const sendPasswordResetEmail = async (to, resetToken, clientBaseUrl) => {
    const baseUrl = clientBaseUrl || process.env.CLIENT_URL || 'http://localhost:5173';
    const resetPasswordUrl = `${baseUrl}/reset-password/${resetToken}`;

    // Always log the link to the terminal so testing is never blocked
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