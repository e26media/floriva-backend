const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    // unique: true,
  },

  phone: {
    type: String,
    required: true,
  },

  photo: {
    type: String, // vendor personal photo
  },

  shopPhoto: {
    type: String, // shop image
  },

  shopLicence: {
    type: String,
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },

  adminNote: {
    type: String,
    default: '',
  },
},
{
  timestamps: true,
}
);

module.exports = mongoose.model("Vendor", vendorSchema);