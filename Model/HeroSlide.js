const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    heading: { type: String, default: 'Exclusive collection <br /> for everyone' },
    subHeading: { type: String, default: 'In this season, find the best 🔥' },
    btnText: { type: String, default: 'Explore shop now' },
    btnLink: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    imageAlt: { type: String, default: '' },
    imageTitle: { type: String, default: '' },
    imageDescription: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    fullBanner: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
