const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      enum: ['instagram', 'facebook', 'tiktok', 'pinterest'],
    },
    label: { type: String, required: true, trim: true },
    url: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialLink', socialLinkSchema);
