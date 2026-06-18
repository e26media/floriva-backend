const nodemailer = require('nodemailer');
const IntegrationSetting = require('../Model/IntegrationSetting');
const EmailTemplate = require('../Model/EmailTemplate');

const SITE_NAME = 'Floriva Gifts';
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || process.env.MAIL_FROM || 'florivagifts@gmail.com';

function applyTemplate(template, vars = {}) {
  let result = template;
  const merged = { siteName: SITE_NAME, ...vars };
  Object.entries(merged).forEach(([key, value]) => {
    result = result.split(`{{${key}}}`).join(String(value ?? ''));
  });
  return result;
}

async function getIntegrationDoc() {
  return IntegrationSetting.findOne({ singleton: 'main' });
}

async function getTransporter() {
  const doc = await getIntegrationDoc();
  const emailCfg = doc?.email;

  const user = process.env.EMAIL_FROM || process.env.MAIL_FROM || process.env.EMAIL || emailCfg?.user || DEFAULT_FROM_EMAIL;
  const pass = process.env.EMAIL_PASSWORD || emailCfg?.password;

  if (!user || !pass) {
    throw new Error('Email is not configured. Set SMTP credentials in Admin → Integrations.');
  }

  if (emailCfg?.provider === 'smtp' && emailCfg?.host) {
    return nodemailer.createTransport({
      host: emailCfg.host,
      port: emailCfg.port || 587,
      secure: Boolean(emailCfg.secure),
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

async function getFromAddress() {
  const doc = await getIntegrationDoc();
  const emailCfg = doc?.email;
  const fromEmail = process.env.EMAIL_FROM || process.env.MAIL_FROM || DEFAULT_FROM_EMAIL;
  const fromName = emailCfg?.fromName || SITE_NAME;
  return `"${fromName}" <${fromEmail}>`;
}

async function sendTemplatedEmail(to, templateKey, vars = {}) {
  const doc = await getIntegrationDoc();
  if (doc?.email?.enabled === false) {
    console.warn('Email sending disabled in admin settings');
    return;
  }

  const template = await EmailTemplate.findOne({ key: templateKey, isActive: true });
  const subject = template
    ? applyTemplate(template.subject, vars)
    : `Message from ${SITE_NAME}`;
  const html = template
    ? applyTemplate(template.htmlBody, vars)
    : `<p>${Object.values(vars).join(' ')}</p>`;

  const transporter = await getTransporter();
  await transporter.sendMail({
    from: await getFromAddress(),
    to,
    subject,
    html,
  });
}

const sendOTP = async (email, otp) => {
  const doc = await getIntegrationDoc();
  const expiryMinutes = doc?.otp?.expiryMinutes || 5;

  await sendTemplatedEmail(email, 'login_otp', {
    otp,
    email,
    expiryMinutes: String(expiryMinutes),
  });
};

const sendWelcomeEmail = async (email, name = '') => {
  await sendTemplatedEmail(email, 'welcome_customer', {
    email,
    name: name || 'there',
  });
};

const formatAddress = (address = {}) => {
  return [
    address.streetAddress1,
    address.streetAddress2,
    address.city,
    address.stateProvinceRegionId,
    address.postalCode,
    address.country,
  ].filter(Boolean).join(', ');
};

const sendOrderEmail = async (email, orderOrId, totalAmount) => {
  const order = typeof orderOrId === 'object' && orderOrId !== null ? orderOrId : null;
  const orderId = order?._id || orderOrId;
  await sendTemplatedEmail(email, 'order_confirmation', {
    email,
    orderId: String(orderId),
    totalAmount: String(order?.totalAmount ?? totalAmount),
    customerName: order?.customerName || '',
    customerPhone: order?.customerPhone || '',
    shippingAddress: formatAddress(order?.shippingAddress),
  });
};

const sendOrderStatusEmail = async (email, order, changes = {}) => {
  await sendTemplatedEmail(email, 'order_status_update', {
    email,
    orderId: String(order?._id || ''),
    status: order?.status || '',
    paymentStatus: order?.paymentStatus || '',
    totalAmount: String(order?.totalAmount ?? ''),
    customerName: order?.customerName || '',
    customerPhone: order?.customerPhone || '',
    shippingAddress: formatAddress(order?.shippingAddress),
    changedFields: Object.keys(changes).join(', '),
  });
};

const sendCancelEmail = async (email, orderId) => {
  await sendTemplatedEmail(email, 'order_cancelled', {
    email,
    orderId: String(orderId),
  });
};

const sendVendorStatusEmail = async (email, templateKey, vars) => {
  await sendTemplatedEmail(email, templateKey, vars);
};

module.exports = {
  sendOTP,
  sendWelcomeEmail,
  sendOrderEmail,
  sendOrderStatusEmail,
  sendCancelEmail,
  sendVendorStatusEmail,
  sendTemplatedEmail,
  applyTemplate,
};
