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

  isVerified: {
    type: Boolean,
    default: false,
  },

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);