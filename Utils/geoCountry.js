const geoip = require("geoip-lite");

const STORE_COUNTRY_BY_ISO = {
  IN: "india",
  AU: "australia",
};

const ASIA_ISO_CODES = new Set([
  "IN", "PK", "BD", "LK", "NP", "BT", "MV", "AF",
]);

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).trim();
  }
  return req.ip || req.socket?.remoteAddress || "";
}

function normalizeStoreCountrySlug(value) {
  const slug = String(value || "").trim().toLowerCase();
  if (slug === "india" || slug === "australia") return slug;
  return null;
}

function mapIsoToStoreCountry(isoCode) {
  const iso = String(isoCode || "").trim().toUpperCase();
  if (STORE_COUNTRY_BY_ISO[iso]) return STORE_COUNTRY_BY_ISO[iso];
  if (ASIA_ISO_CODES.has(iso)) return "india";
  return "australia";
}

function detectStoreCountryFromRequest(req) {
  const ip = getClientIp(req);
  const lookup = ip ? geoip.lookup(ip) : null;
  const countrySlug = mapIsoToStoreCountry(lookup?.country);
  return {
    countrySlug,
    ip: ip || null,
    isoCode: lookup?.country || null,
    source: lookup ? "geoip" : "default",
  };
}

module.exports = {
  getClientIp,
  normalizeStoreCountrySlug,
  mapIsoToStoreCountry,
  detectStoreCountryFromRequest,
};
