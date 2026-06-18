function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) {
    digits = `+${digits.slice(2)}`;
  }
  if (!digits.startsWith("+")) {
    digits = `+${digits.replace(/^\+/, "")}`;
  }

  const national = digits.slice(1);
  if (!/^\d{7,15}$/.test(national)) return null;
  return digits;
}

function isValidPhone(value) {
  return Boolean(normalizePhone(value));
}

module.exports = { normalizePhone, isValidPhone };
