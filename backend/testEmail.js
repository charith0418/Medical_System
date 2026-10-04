// backend/server/test-email.js
require('dotenv').config();
const sendWelcomeEmail = require('./utils/sendEmail');

async function testRun() {
    console.log("🔍 Checking Environment Variables...");
    console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
    console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "•••••••• (Loaded)" : "❌ NOT LOADED");

    console.log("\n🚀 Attempting to send test email...");
    
    try {
        const result = await sendWelcomeEmail(
            process.env.EMAIL_USER, // Sends a test email to yourself
            "Test User",
            "PAT-TEST-123",
            "1998-05-15"
        );

        if (result) {
            console.log("🎉 SUCCESS! Email sent successfully.");
            console.log("Message ID:", result.messageId);
        } else {
            console.log("❌ FAILED! Check the console output above for error details.");
        }
    } catch (error) {
        console.error("💥 Execution Error:", error);
    }
}

testRun();