const HeroSlide = require('../Model/HeroSlide');
const SiteImage = require('../Model/SiteImage');

const SITE_IMAGE_DEFINITIONS = [
  { key: 'promo_2', label: 'Promo banner (homepage)' },
];

const buildImagePath = (file) =>
  file ? `/uploads/site-content/${file.filename}` : null;

exports.seedSiteContent = async () => {
  for (const def of SITE_IMAGE_DEFINITIONS) {
    const exists = await SiteImage.findOne({ key: def.key });
    if (!exists) {
      await SiteImage.create({ ...def, imageUrl: '', isActive: true });
    }
  }
};

exports.getPublicSiteContent = async (req, res) => {
  try {
    const [heroSlides, siteImages] = await Promise.all([
      HeroSlide.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }),
      SiteImage.find({ isActive: true, imageUrl: { $ne: '' } }),
    ]);

    res.json({
      success: true,
      data: {
        heroSlides,
        siteImages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminSiteContent = async (req, res) => {
  try {
    const [heroSlides, siteImages] = await Promise.all([
      HeroSlide.find().sort({ sortOrder: 1, createdAt: 1 }),
      SiteImage.find().sort({ key: 1 }),
    ]);

    res.json({
      success: true,
      data: {
        heroSlides,
        siteImages,
        siteImageDefinitions: SITE_IMAGE_DEFINITIONS,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createHeroSlide = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: 'Missing form data' });
    }

    const imageUrl = buildImagePath(req.file);
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Hero image is required' });
    }

    const count = await HeroSlide.countDocuments();
    const slide = await HeroSlide.create({
      heading: req.body.heading || '',
      subHeading: req.body.subHeading || '',
      btnText: req.body.btnText || 'Explore shop now',
      imageUrl,
      sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : count,
      isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
    });

    res.status(201).json({ success: true, data: slide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Hero slide not found' });
    }

    if (req.body?.heading !== undefined) slide.heading = req.body.heading;
    if (req.body?.subHeading !== undefined) slide.subHeading = req.body.subHeading;
    if (req.body?.btnText !== undefined) slide.btnText = req.body.btnText;
    if (req.body?.sortOrder !== undefined) slide.sortOrder = Number(req.body.sortOrder);
    if (req.body?.isActive !== undefined) {
      slide.isActive = req.body.isActive !== 'false' && req.body.isActive !== false;
    }

    const newImage = buildImagePath(req.file);
    if (newImage) slide.imageUrl = newImage;

    await slide.save();
    res.json({ success: true, data: slide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Hero slide not found' });
    }
    res.json({ success: true, message: 'Hero slide deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSiteImage = async (req, res) => {
  try {
    const { key } = req.params;
    const def = SITE_IMAGE_DEFINITIONS.find((d) => d.key === key);
    if (!def) {
      return res.status(400).json({ success: false, message: 'Unknown site image key' });
    }

    let record = await SiteImage.findOne({ key });
    if (!record) {
      record = new SiteImage({ key, label: def.label });
    }

    if (req.body?.label) record.label = req.body.label;
    if (req.body?.isActive !== undefined) {
      record.isActive = req.body.isActive !== 'false' && req.body.isActive !== false;
    }

    const newImage = buildImagePath(req.file);
    if (newImage) record.imageUrl = newImage;

    if (!record.imageUrl && !newImage) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    await record.save();
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
