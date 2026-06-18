const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  username: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  googleId: {
    type: String,
  },

  otp: String,
  otpExpire: Date,
  pendingAuthPurpose: {
    type: String,
    enum: ["login", "signup"],
    default: "login",
  },
  welcomeEmailSent: {
    type: Boolean,
    default: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  countrySlug: {
    type: String,
    trim: true,
    lowercase: true,
    default: null,
  },

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);