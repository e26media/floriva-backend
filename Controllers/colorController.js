const Color = require('../Model/Color');


const createColor = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Color name is required"
      });
    }

    const existingColor = await Color.findOne({ name: name.trim() });

    if (existingColor) {
      return res.status(400).json({
        success: false,
        message: "Color already exists"
      });
    }

    const color = await Color.create({
      name: name.trim()
    });

    res.status(201).json({
      success: true,
      message: "Color created successfully",
      data: color
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getAllColors = async (req, res) => {
  try {
    const colors = await Color.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: colors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const getSingleColor = async (req, res) => {
  try {
    const { id } = req.params;

    const color = await Color.findById(id);

    if (!color) {
      return res.status(404).json({
        success: false,
        message: "Color not found"
      });
    }

    res.status(200).json({
      success: true,
      data: color
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Color name is required"
      });
    }

    const updatedColor = await Color.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updatedColor) {
      return res.status(404).json({
        success: false,
        message: "Color not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Color updated successfully",
      data: updatedColor
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const deleteColor = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedColor = await Color.findByIdAndDelete(id);

    if (!deletedColor) {
      return res.status(404).json({
        success: false,
        message: "Color not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Color deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



module.exports = {
  createColor,
  getAllColors,
  getSingleColor,
  updateColor,
  deleteColor
};