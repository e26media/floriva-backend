const express = require("express");
const { detectCountry } = require("../Controllers/geoController");

const router = express.Router();

router.get("/geo/detect", detectCountry);

module.exports = router;
