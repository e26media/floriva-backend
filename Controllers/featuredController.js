const FeaturedProduct = require('../Model/FeaturedProduct');


const createFeaturedProduct = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Featured product name is required"
      });
    }

    const existingFeaturedProduct = await FeaturedProduct.findOne({ name: name.trim() });

    if (existingFeaturedProduct) {
      return res.status(400).json({
        success: false,
        message: "Featured product already exists"
      });
    }

    const featuredProduct = await FeaturedProduct.create({
      name: name.trim()
    });

    res.status(201).json({
      success: true,
      message: "Featured product created successfully",
      data: featuredProduct
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getAllFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await FeaturedProduct.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: featuredProducts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const getSingleFeaturedProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const featuredProduct = await FeaturedProduct.findById(id);

    if (!featuredProduct) {
      return res.status(404).json({
        success: false,
        message: "Featured product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: featuredProduct
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const updateFeaturedProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Featured product name is required"
      });
    }

    const updatedFeaturedProduct = await FeaturedProduct.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updatedFeaturedProduct) {
      return res.status(404).json({
        success: false,
        message: "Featured product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Featured product updated successfully",
      data: updatedFeaturedProduct
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const deleteFeaturedProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFeaturedProduct = await FeaturedProduct.findByIdAndDelete(id);

    if (!deletedFeaturedProduct) {
      return res.status(404).json({
        success: false,
        message: "Featured product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Featured product deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



module.exports = {
  createFeaturedProduct,
  getAllFeaturedProducts,
  getSingleFeaturedProduct,
  updateFeaturedProduct,
  deleteFeaturedProduct 
};