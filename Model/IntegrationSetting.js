const mongoose = require('mongoose');

const integrationSettingSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    email: {
      enabled: { type: Boolean, default: true },
      provider: { type: String, default: 'smtp' },
      host: { type: String, default: 'smtp.gmail.com' },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String, default: '' },
      password: { type: String, default: '' },
      fromEmail: { type: String, default: '' },
      fromName: { type: String, default: 'Floriva Gifts' },
    },
    sms: {
      enabled: { type: Boolean, default: false },
      provider: { type: String, default: 'twilio' },
      accountSid: { type: String, default: '' },
      authToken: { type: String, default: '' },
      fromNumber: { type: String, default: '' },
      apiKey: { type: String, default: '' },
      apiUrl: { type: String, default: '' },
    },
    delivery: {
      enabled: { type: Boolean, default: false },
      provider: { type: String, default: 'manual' },
      apiKey: { type: String, default: '' },
      apiSecret: { type: String, default: '' },
      webhookUrl: { type: String, default: '' },
      trackingUrlTemplate: { type: String, default: '' },
    },
    otp: {
      channel: { type: String, enum: ['email', 'sms', 'both'], default: 'email' },
      expiryMinutes: { type: Number, default: 5 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IntegrationSetting', integrationSettingSchema);
