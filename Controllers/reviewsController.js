// review conrtroller

const Review = require('../Model/Review');

// Create Review
const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    const review = new Review({
      product,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message
    });
  }
};


// review all view
const reviewView = async (req, res) => {
    try {
        const reviews = await Review.find().populate('product');
        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve reviews",
            error: error.message
        });
    }
};

//review single view
const reviewSingleView = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id).populate('product');
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }
        res.status(200).json({
            success: true,
            review
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve review",
            error: error.message
        });
    }
};

//edite review
const editReview = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const review = await Review.findByIdAndUpdate(id, updatedData, { new: true });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update review",
            error: error.message
        });
    }
};

// delete review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndDelete(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete review",
            error: error.message
        });
    }
};


module.exports = { createReview, reviewView, reviewSingleView, deleteReview,editReview };