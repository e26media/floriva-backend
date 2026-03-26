const express = require("express");
const router = express.Router();

const {
  createVendor,
  getVendors,
  getVendor,
  updateVendor,
  deleteVendor,
} = require("../Controllers/vendorController");
const { vendorUpload } = require("../Middlewares/multer");


// CREATE
router.post("/vendor",vendorUpload, createVendor);

// GET ALL
router.get("/vendors", getVendors);

// GET SINGLE
router.get("/vendor/:id", getVendor);

// UPDATE
router.put("/vendor/:id", updateVendor);

// DELETE
router.delete("/vendor/:id", deleteVendor);

module.exports = router;