const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    heading: { type: String, default: 'Exclusive collection <br /> for everyone' },
    subHeading: { type: String, default: 'In this season, find the best 🔥' },
    btnText: { type: String, default: 'Explore shop now' },
    imageUrl: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    fullBanner: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
