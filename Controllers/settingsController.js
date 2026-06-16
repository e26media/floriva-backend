const IntegrationSetting = require('../Model/IntegrationSetting');
const EmailTemplate = require('../Model/EmailTemplate');

const DEFAULT_TEMPLATES = [
  {
    key: 'login_otp',
    name: 'Login OTP email',
    subject: 'Your Floriva Gifts login code',
    description: 'Sent when a customer requests a login verification code.',
    placeholders: ['{{otp}}', '{{email}}', '{{expiryMinutes}}', '{{siteName}}'],
    htmlBody: `<!DOCTYPE html>
<html>
<body style="font-family:Segoe UI,sans-serif;background:#fdf2f8;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
    <h1 style="color:#db2777;margin:0 0 8px;font-size:22px">{{siteName}}</h1>
    <p style="color:#6b7280;margin:0 0 24px">Your one-time login code</p>
    <div style="background:#fce7f3;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
      <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#be185d">{{otp}}</span>
    </div>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0">
      This code expires in <strong>{{expiryMinutes}} minutes</strong>.<br/>
      If you did not request this, you can safely ignore this email.
    </p>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px">Sent to {{email}}</p>
  </div>
</body>
</html>`,
  },
  {
    key: 'order_confirmation',
    name: 'Order confirmation',
    subject: 'Order confirmed — {{orderId}}',
    description: 'Sent after a successful order placement.',
    placeholders: ['{{orderId}}', '{{totalAmount}}', '{{email}}', '{{siteName}}'],
    htmlBody: `<!DOCTYPE html>
<html><body style="font-family:Segoe UI,sans-serif;padding:24px">
  <h2 style="color:#db2777">{{siteName}}</h2>
  <p>Thank you for your order!</p>
  <p><strong>Order ID:</strong> {{orderId}}<br/><strong>Total:</strong> {{totalAmount}}</p>
</body></html>`,
  },
  {
    key: 'order_cancelled',
    name: 'Order cancelled',
    subject: 'Order cancelled — {{orderId}}',
    description: 'Sent when an order is cancelled.',
    placeholders: ['{{orderId}}', '{{email}}', '{{siteName}}'],
    htmlBody: `<!DOCTYPE html>
<html><body style="font-family:Segoe UI,sans-serif;padding:24px">
  <h2 style="color:#db2777">{{siteName}}</h2>
  <p>Your order <strong>{{orderId}}</strong> has been cancelled.</p>
</body></html>`,
  },
  {
    key: 'vendor_approved',
    name: 'Business join approved',
    subject: 'Welcome to {{siteName}} — application approved',
    description: 'Sent when admin approves a business join request.',
    placeholders: ['{{businessName}}', '{{email}}', '{{siteName}}'],
    htmlBody: `<!DOCTYPE html>
<html><body style="font-family:Segoe UI,sans-serif;padding:24px">
  <h2 style="color:#db2777">{{siteName}}</h2>
  <p>Hi {{businessName}}, your business join application has been <strong>approved</strong>.</p>
</body></html>`,
  },
  {
    key: 'vendor_rejected',
    name: 'Business join rejected',
    subject: 'Update on your {{siteName}} application',
    description: 'Sent when admin rejects a business join request.',
    placeholders: ['{{businessName}}', '{{adminNote}}', '{{siteName}}'],
    htmlBody: `<!DOCTYPE html>
<html><body style="font-family:Segoe UI,sans-serif;padding:24px">
  <h2 style="color:#db2777">{{siteName}}</h2>
  <p>Hi {{businessName}}, we are unable to approve your application at this time.</p>
  <p>{{adminNote}}</p>
</body></html>`,
  },
];

exports.seedAdminSettings = async () => {
  let integrations = await IntegrationSetting.findOne({ singleton: 'main' });
  if (!integrations) {
    integrations = await IntegrationSetting.create({
      singleton: 'main',
      email: {
        enabled: Boolean(process.env.EMAIL),
        user: process.env.EMAIL || '',
        password: process.env.EMAIL_PASSWORD || '',
        fromEmail: process.env.EMAIL || '',
        fromName: 'Floriva Gifts',
      },
    });
  }

  for (const tpl of DEFAULT_TEMPLATES) {
    const exists = await EmailTemplate.findOne({ key: tpl.key });
    if (!exists) await EmailTemplate.create(tpl);
  }

  return integrations;
};

exports.getIntegrations = async (req, res) => {
  try {
    let doc = await IntegrationSetting.findOne({ singleton: 'main' });
    if (!doc) doc = await IntegrationSetting.create({ singleton: 'main' });

    const data = doc.toObject();
    if (data.email?.password) data.email.password = '••••••••';
    if (data.sms?.authToken && data.sms.authToken) data.sms.authToken = '••••••••';
    if (data.delivery?.apiSecret && data.delivery.apiSecret) data.delivery.apiSecret = '••••••••';

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateIntegrations = async (req, res) => {
  try {
    let doc = await IntegrationSetting.findOne({ singleton: 'main' });
    if (!doc) doc = await IntegrationSetting.create({ singleton: 'main' });

    const { email, sms, delivery, otp } = req.body;

    if (email) {
      const keepPassword = !email.password || email.password === '••••••••';
      Object.keys(email).forEach((key) => {
        if (key === 'password' && keepPassword) return;
        doc.email[key] = email[key];
      });
      doc.markModified('email');
    }
    if (sms) {
      const keepToken = !sms.authToken || sms.authToken === '••••••••';
      Object.keys(sms).forEach((key) => {
        if (key === 'authToken' && keepToken) return;
        doc.sms[key] = sms[key];
      });
      doc.markModified('sms');
    }
    if (delivery) {
      const keepSecret = !delivery.apiSecret || delivery.apiSecret === '••••••••';
      Object.keys(delivery).forEach((key) => {
        if (key === 'apiSecret' && keepSecret) return;
        doc.delivery[key] = delivery[key];
      });
      doc.markModified('delivery');
    }
    if (otp) {
      Object.assign(doc.otp, otp);
      doc.markModified('otp');
    }

    await doc.save();

    const data = doc.toObject();
    if (data.email?.password) data.email.password = '••••••••';
    if (data.sms?.authToken) data.sms.authToken = data.sms.authToken ? '••••••••' : '';
    if (data.delivery?.apiSecret) data.delivery.apiSecret = data.delivery.apiSecret ? '••••••••' : '';

    res.json({ success: true, data, message: 'Integration settings saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmailTemplates = async (req, res) => {
  try {
    let templates = await EmailTemplate.find().sort({ key: 1 });
    if (templates.length === 0) {
      for (const tpl of DEFAULT_TEMPLATES) {
        const exists = await EmailTemplate.findOne({ key: tpl.key });
        if (!exists) await EmailTemplate.create(tpl);
      }
      templates = await EmailTemplate.find().sort({ key: 1 });
    }
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedEmailTemplates = async (req, res) => {
  try {
    let created = 0;
    let updated = 0;
    for (const tpl of DEFAULT_TEMPLATES) {
      const existing = await EmailTemplate.findOne({ key: tpl.key });
      if (!existing) {
        await EmailTemplate.create(tpl);
        created += 1;
      } else if (req.body?.reset === true) {
        existing.subject = tpl.subject;
        existing.htmlBody = tpl.htmlBody;
        existing.name = tpl.name;
        existing.description = tpl.description;
        existing.placeholders = tpl.placeholders;
        await existing.save();
        updated += 1;
      }
    }
    const templates = await EmailTemplate.find().sort({ key: 1 });
    res.json({
      success: true,
      data: templates,
      message: `Templates ready (${created} created, ${updated} reset)`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEmailTemplate = async (req, res) => {
  try {
    const { key, name, subject, htmlBody, description, isActive } = req.body;
    const normalizedKey = String(key || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    if (!normalizedKey || !name?.trim() || !subject?.trim() || !htmlBody?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Key, name, subject, and HTML body are required',
      });
    }

    const exists = await EmailTemplate.findOne({ key: normalizedKey });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Template key already exists' });
    }

    const template = await EmailTemplate.create({
      key: normalizedKey,
      name: name.trim(),
      subject: subject.trim(),
      htmlBody,
      description: description || '',
      placeholders: [],
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, data: template, message: 'Template created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({ key: req.params.key });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const { name, subject, htmlBody, description, isActive } = req.body;
    if (name !== undefined) template.name = name;
    if (subject !== undefined) template.subject = subject;
    if (htmlBody !== undefined) template.htmlBody = htmlBody;
    if (description !== undefined) template.description = description;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();
    res.json({ success: true, data: template, message: 'Template saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.previewEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({ key: req.params.key });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const sampleVars = {
      otp: '482916',
      email: 'customer@example.com',
      expiryMinutes: '5',
      siteName: 'Floriva Gifts',
      orderId: 'ORD-12345',
      totalAmount: '₹2,499',
      businessName: 'Sample Florist',
      adminNote: 'Please resubmit with a valid licence document.',
    };

    let html = template.htmlBody;
    let subject = template.subject;
    Object.entries(sampleVars).forEach(([key, value]) => {
      const token = `{{${key}}}`;
      html = html.split(token).join(value);
      subject = subject.split(token).join(value);
    });

    res.json({ success: true, data: { subject, html } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
