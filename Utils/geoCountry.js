let geoip = null;
try {
  geoip = require("geoip-lite");
} catch {
  console.warn("[geo] geoip-lite not installed — using default country mapping");
}

const STORE_COUNTRY_BY_ISO = {
  IN: "india",
  AU: "australia",
};

const ASIA_ISO_CODES = new Set([
  "IN", "PK", "BD", "LK", "NP", "BT", "MV", "AF",
]);

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const firstForwarded =
    typeof forwarded === "string" && forwarded.trim()
      ? forwarded.split(",")[0].trim()
      : Array.isArray(forwarded) && forwarded[0]
        ? String(forwarded[0]).trim()
        : "";

  const raw =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    firstForwarded ||
    req.ip ||
    req.socket?.remoteAddress ||
    "";

  return String(raw).trim().replace(/^::ffff:/, "");
}

function normalizeStoreCountrySlug(value) {
  const slug = String(value || "").trim().toLowerCase();
  if (slug === "india" || slug === "australia") return slug;
  return null;
}

function mapIsoToStoreCountry(isoCode) {
  const iso = String(isoCode || "").trim().toUpperCase();
  if (!iso) return null;
  if (STORE_COUNTRY_BY_ISO[iso]) return STORE_COUNTRY_BY_ISO[iso];
  if (ASIA_ISO_CODES.has(iso)) return "india";
  return "australia";
}

function detectStoreCountryFromRequest(req) {
  const ip = getClientIp(req);
  const lookup = geoip && ip ? geoip.lookup(ip) : null;
  const countrySlug = mapIsoToStoreCountry(lookup?.country);
  return {
    countrySlug,
    ip: ip || null,
    isoCode: lookup?.country || null,
    source: lookup ? "geoip" : countrySlug ? "mapped" : "unknown",
  };
}

module.exports = {
  getClientIp,
  normalizeStoreCountrySlug,
  mapIsoToStoreCountry,
  detectStoreCountryFromRequest,
};
