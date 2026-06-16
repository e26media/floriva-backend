const HeroSlide = require('../Model/HeroSlide');
const SiteImage = require('../Model/SiteImage');
const SocialLink = require('../Model/SocialLink');

const SITE_IMAGE_DEFINITIONS = [
  { key: 'promo_2', label: 'Promo banner (homepage — below best sellers)' },
  { key: 'hero_fallback', label: 'Hero fallback banner (when no carousel slides)' },
];

const SOCIAL_LINK_DEFINITIONS = [
  { platform: 'instagram', label: 'Instagram' },
  { platform: 'facebook', label: 'Facebook' },
  { platform: 'tiktok', label: 'TikTok' },
  { platform: 'pinterest', label: 'Pinterest' },
];

const buildImagePath = (file) =>
  file ? `/uploads/site-content/${file.filename}` : null;

const parseBool = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return value !== 'false' && value !== false;
};

const applyHeroMetaFields = (slide, body = {}) => {
  if (body.heading !== undefined) slide.heading = body.heading;
  if (body.subHeading !== undefined) slide.subHeading = body.subHeading;
  if (body.btnText !== undefined) slide.btnText = body.btnText;
  if (body.btnLink !== undefined) slide.btnLink = body.btnLink;
  if (body.sortOrder !== undefined) slide.sortOrder = Number(body.sortOrder);
  if (body.isActive !== undefined) slide.isActive = parseBool(body.isActive, slide.isActive);
  if (body.fullBanner !== undefined) slide.fullBanner = parseBool(body.fullBanner, slide.fullBanner);
  if (body.imageAlt !== undefined) slide.imageAlt = body.imageAlt;
  if (body.imageTitle !== undefined) slide.imageTitle = body.imageTitle;
  if (body.imageDescription !== undefined) slide.imageDescription = body.imageDescription;
};

const applySiteImageMetaFields = (record, body = {}) => {
  if (body.label !== undefined) record.label = body.label;
  if (body.linkUrl !== undefined) record.linkUrl = body.linkUrl;
  if (body.imageAlt !== undefined) record.imageAlt = body.imageAlt;
  if (body.imageTitle !== undefined) record.imageTitle = body.imageTitle;
  if (body.imageDescription !== undefined) record.imageDescription = body.imageDescription;
  if (body.isActive !== undefined) {
    record.isActive = parseBool(body.isActive, record.isActive);
  }
};

exports.seedSiteContent = async () => {
  for (const def of SITE_IMAGE_DEFINITIONS) {
    const exists = await SiteImage.findOne({ key: def.key });
    if (!exists) {
      await SiteImage.create({ ...def, imageUrl: '', isActive: true });
    }
  }

  for (const def of SOCIAL_LINK_DEFINITIONS) {
    const exists = await SocialLink.findOne({ platform: def.platform });
    if (!exists) {
      await SocialLink.create({ ...def, url: '', isActive: true });
    }
  }
};

exports.getPublicSiteContent = async (req, res) => {
  try {
    const [heroSlides, siteImages, socialLinks] = await Promise.all([
      HeroSlide.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }),
      SiteImage.find({ isActive: true, imageUrl: { $ne: '' } }),
      SocialLink.find({ isActive: true, url: { $ne: '' } }).sort({ platform: 1 }),
    ]);

    res.json({
      success: true,
      data: {
        heroSlides,
        siteImages,
        socialLinks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminSiteContent = async (req, res) => {
  try {
    const [heroSlides, siteImages, socialLinks] = await Promise.all([
      HeroSlide.find().sort({ sortOrder: 1, createdAt: 1 }),
      SiteImage.find().sort({ key: 1 }),
      SocialLink.find().sort({ platform: 1 }),
    ]);

    res.json({
      success: true,
      data: {
        heroSlides,
        siteImages,
        socialLinks,
        siteImageDefinitions: SITE_IMAGE_DEFINITIONS,
        socialLinkDefinitions: SOCIAL_LINK_DEFINITIONS,
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
      btnLink: req.body.btnLink || '',
      imageUrl,
      imageAlt: req.body.imageAlt || '',
      imageTitle: req.body.imageTitle || '',
      imageDescription: req.body.imageDescription || '',
      sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : count,
      isActive: parseBool(req.body.isActive, true),
      fullBanner: parseBool(req.body.fullBanner, true),
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

    applyHeroMetaFields(slide, req.body);

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

    applySiteImageMetaFields(record, req.body);

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

exports.updateSocialLink = async (req, res) => {
  try {
    const { platform } = req.params;
    const def = SOCIAL_LINK_DEFINITIONS.find((d) => d.platform === platform);
    if (!def) {
      return res.status(400).json({ success: false, message: 'Unknown social platform' });
    }

    let record = await SocialLink.findOne({ platform });
    if (!record) {
      record = new SocialLink({ platform, label: def.label });
    }

    if (req.body?.url !== undefined) record.url = String(req.body.url).trim();
    if (req.body?.label !== undefined) record.label = req.body.label;
    if (req.body?.isActive !== undefined) {
      record.isActive = parseBool(req.body.isActive, record.isActive);
    }

    await record.save();
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.runSecurityChecks = async (req, res) => {
  try {
    const checks = [
      {
        id: 'session',
        label: 'Admin session',
        status: 'pass',
        detail: `Signed in as ${req.admin.username}`,
      },
      {
        id: 'jwt',
        label: 'JWT authentication',
        status: 'pass',
        detail: 'Bearer token verified for this request',
      },
      {
        id: 'https',
        label: 'API over HTTPS (production)',
        status:
          req.headers['x-forwarded-proto'] === 'https' ||
          req.secure ||
          process.env.NODE_ENV !== 'production'
            ? 'pass'
            : 'warn',
        detail: 'Admin API should always be accessed over HTTPS in production',
      },
      {
        id: 'protected_routes',
        label: 'Protected CMS routes',
        status: 'pass',
        detail: 'This endpoint requires admin authentication',
      },
    ];

    res.json({ success: true, data: { checks, testedAt: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
