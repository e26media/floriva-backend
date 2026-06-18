const { normalizePhone } = require("./phone");

function isValidEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function parseContactInput({ email, phone, contact }) {
  let normalizedEmail = String(email || "").trim().toLowerCase() || null;
  let normalizedPhone = normalizePhone(phone);
  const rawContact = String(contact || "").trim();

  if (!normalizedEmail && !normalizedPhone && rawContact) {
    if (rawContact.includes("@")) {
      normalizedEmail = rawContact.toLowerCase();
    } else {
      normalizedPhone = normalizePhone(rawContact);
    }
  }

  if (normalizedEmail && !isValidEmail(normalizedEmail)) {
    normalizedEmail = null;
  }

  const channel = normalizedEmail ? "email" : normalizedPhone ? "sms" : null;

  return {
    normalizedEmail,
    normalizedPhone,
    channel,
  };
}

module.exports = {
  isValidEmail,
  parseContactInput,
};
