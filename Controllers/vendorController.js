const Vendor = require("../Model/Vendor");

// CREATE VENDOR
exports.createVendor = async (req, res) => {
  try {

    const vendor = new Vendor({
      name: req.body.name,
      address: req.body.address,
      email: req.body.email,
      phone: req.body.phone,
     photo: req.files?.photo ? req.files.photo[0].filename : "",
      shopPhoto: req.files?.shopPhoto ? req.files.shopPhoto[0].filename : "",
      shopLicence: req.body.shopLicence, // Assuming this is a text field, not a file upload
    });

    const savedVendor = await vendor.save();

    res.status(201).json({
      success: true,
      data: savedVendor,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET ALL VENDORS
exports.getVendors = async (req, res) => {
  try {

    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: vendors,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET SINGLE VENDOR
exports.getVendor = async (req, res) => {
  try {

    const vendor = await Vendor.findById(req.params.id);

    res.json({
      success: true,
      data: vendor,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// UPDATE VENDOR
exports.updateVendor = async (req, res) => {
  try {

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: vendor,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// DELETE VENDOR
exports.deleteVendor = async (req, res) => {
  try {

    await Vendor.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Vendor deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};