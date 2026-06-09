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
const { authenticateAdmin } = require("../Middlewares/adminAuth");

router.post("/vendor", vendorUpload, createVendor);
router.get("/vendors", authenticateAdmin, getVendors);
router.get("/vendor/:id", authenticateAdmin, getVendor);
router.put("/vendor/:id", authenticateAdmin, updateVendor);
router.delete("/vendor/:id", authenticateAdmin, deleteVendor);

module.exports = router;