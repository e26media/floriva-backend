const express = require('express');
const multer = require('multer');
const {
  getPublicSiteContent,
  getAdminSiteContent,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  updateSiteImage,
  updateSocialLink,
  runSecurityChecks,
} = require('../Controllers/siteContentController');
const { authenticateAdmin } = require('../Middlewares/adminAuth');
const { siteContentUpload } = require('../Middlewares/multer');

const router = express.Router();

const handleUpload = (req, res, next) => {
  siteContentUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message:
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Image too large. Maximum size is 5 MB.'
            : err.message,
      });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.get('/site-content', getPublicSiteContent);
router.get('/site-content/admin', authenticateAdmin, getAdminSiteContent);
router.post('/site-content/hero-slides', authenticateAdmin, handleUpload, createHeroSlide);
router.put('/site-content/hero-slides/:id', authenticateAdmin, handleUpload, updateHeroSlide);
router.delete('/site-content/hero-slides/:id', authenticateAdmin, deleteHeroSlide);
router.put('/site-content/site-images/:key', authenticateAdmin, handleUpload, updateSiteImage);
router.put('/site-content/social-links/:platform', authenticateAdmin, updateSocialLink);
router.get('/site-content/security-check', authenticateAdmin, runSecurityChecks);

module.exports = router;
