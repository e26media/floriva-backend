const Country = require("../Model/country");
const { detectStoreCountryFromRequest } = require("../Utils/geoCountry");

const detectCountry = async (req, res) => {
  try {
    const detected = detectStoreCountryFromRequest(req);
    const slug = detected.countrySlug || "india";
    const storeCountry = await Country.findOne({
      name: new RegExp(`^${slug}$`, "i"),
    }).lean();

    res.json({
      success: true,
      countrySlug: slug,
      countryName: storeCountry?.name || slug,
      country: storeCountry || null,
      isoCode: detected.isoCode,
      source: detected.source,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { detectCountry };
