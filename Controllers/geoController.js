const Country = require("../Model/country");
const { detectStoreCountryFromRequest } = require("../Utils/geoCountry");

const detectCountry = async (req, res) => {
  try {
    const detected = detectStoreCountryFromRequest(req);
    const storeCountry = await Country.findOne({
      name: new RegExp(`^${detected.countrySlug}$`, "i"),
    }).lean();

    res.json({
      success: true,
      countrySlug: detected.countrySlug,
      countryName: storeCountry?.name || detected.countrySlug,
      country: storeCountry || null,
      isoCode: detected.isoCode,
      source: detected.source,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { detectCountry };
