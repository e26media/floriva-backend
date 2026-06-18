const IntegrationSetting = require("../Model/IntegrationSetting");

async function getSmsConfig() {
  const doc = await IntegrationSetting.findOne({ singleton: "main" });
  const sms = doc?.sms || {};
  return {
    enabled: Boolean(sms.enabled),
    accountSid: sms.accountSid || process.env.TWILIO_ACCOUNT_SID || "",
    authToken: sms.authToken || process.env.TWILIO_AUTH_TOKEN || "",
    fromNumber: sms.fromNumber || process.env.TWILIO_FROM_NUMBER || "",
  };
}

async function sendSmsOtp(phone, otp) {
  const cfg = await getSmsConfig();
  if (!cfg.enabled || !cfg.accountSid || !cfg.authToken || !cfg.fromNumber) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[SMS OTP dev] ${phone}: ${otp}`);
    }
    return { sent: false, reason: "sms_not_configured" };
  }

  const body = `Your Floriva Gifts verification code is ${otp}. Valid for 5 minutes.`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`;
  const auth = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: phone,
      From: cfg.fromNumber,
      Body: body,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SMS failed: ${text.slice(0, 200)}`);
  }

  return { sent: true };
}

module.exports = { sendSmsOtp };
