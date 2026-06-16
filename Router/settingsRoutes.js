const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../Middlewares/adminAuth');
const {
  getIntegrations,
  updateIntegrations,
  getEmailTemplates,
  updateEmailTemplate,
  previewEmailTemplate,
} = require('../Controllers/settingsController');

router.get('/admin/integrations', authenticateAdmin, getIntegrations);
router.put('/admin/integrations', authenticateAdmin, updateIntegrations);
router.get('/admin/email-templates', authenticateAdmin, getEmailTemplates);
router.put('/admin/email-templates/:key', authenticateAdmin, updateEmailTemplate);
router.get('/admin/email-templates/:key/preview', authenticateAdmin, previewEmailTemplate);

module.exports = router;
