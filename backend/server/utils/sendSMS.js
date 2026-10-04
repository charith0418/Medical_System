// utils/sendSMS.js

const axios = require("axios");

const sendSMS = async (phone, message) => {
  if (!phone) {
    throw new Error("Patient phone number is required.");
  }

  if (!message) {
    throw new Error("SMS message is required.");
  }

  const userId = process.env.NOTIFY_USER_ID;
  const apiKey = process.env.NOTIFY_API_KEY;
  const senderId = process.env.NOTIFY_SENDER_ID || "NotifyDEMO";

  if (!userId || !apiKey) {
    throw new Error(
      "Notify.lk configuration is missing. Check NOTIFY_USER_ID and NOTIFY_API_KEY in .env."
    );
  }

  // Convert Sri Lankan number to 947XXXXXXXX
  let cleanPhone = String(phone)
    .trim()
    .replace(/\s+/g, "")
    .replace(/^\+/, "");

  if (cleanPhone.startsWith("0")) {
    cleanPhone = `94${cleanPhone.substring(1)}`;
  } else if (!cleanPhone.startsWith("94") && cleanPhone.length === 9) {
    cleanPhone = `94${cleanPhone}`;
  }

  if (!/^94\d{9}$/.test(cleanPhone)) {
    throw new Error(
      `Invalid Sri Lankan phone number format (${phone}). Expected 07XXXXXXXX or 947XXXXXXXX.`
    );
  }

  try {
    console.log(`📡 Sending SMS via Notify.lk to: ${cleanPhone}`);

    const response = await axios.get(
      "https://app.notify.lk/api/v1/send",
      {
        params: {
          user_id: userId,
          api_key: apiKey,
          sender_id: senderId,
          to: cleanPhone,
          message: message,
        },
        timeout: 15000,
      }
    );

    console.log("✅ Notify.lk response:", response.data);

    if (
      response.data?.status !== "success" &&
      response.data?.code !== 200
    ) {
      throw new Error(
        response.data?.message ||
          response.data?.data ||
          "Notify.lk API failed to dispatch SMS."
      );
    }

    return response.data;
  } catch (error) {
    const notifyError =
      error.response?.data?.message ||
      error.response?.data?.data ||
      error.message;

    console.error("❌ Notify.lk SMS Error:", notifyError);

    throw new Error(`SMS sending failed: ${notifyError}`);
  }
};

module.exports = sendSMS;