const mongoose = require('mongoose');

const siteImageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    imageTitle: { type: String, default: '' },
    imageDescription: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteImage', siteImageSchema);
