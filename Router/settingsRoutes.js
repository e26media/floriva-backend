const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../Middlewares/adminAuth');
const {
  getIntegrations,
  updateIntegrations,
  getEmailTemplates,
  seedEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  previewEmailTemplate,
} = require('../Controllers/settingsController');

router.get('/admin/integrations', authenticateAdmin, getIntegrations);
router.put('/admin/integrations', authenticateAdmin, updateIntegrations);
router.get('/admin/email-templates', authenticateAdmin, getEmailTemplates);
router.post('/admin/email-templates/seed', authenticateAdmin, seedEmailTemplates);
router.post('/admin/email-templates', authenticateAdmin, createEmailTemplate);
router.get('/admin/email-templates/:key/preview', authenticateAdmin, previewEmailTemplate);
router.put('/admin/email-templates/:key', authenticateAdmin, updateEmailTemplate);

module.exports = router;
