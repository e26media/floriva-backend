const Color = require('../Model/Color');


const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

const normalizeHex = (hex) => {
  const value = String(hex || '#cccccc').trim();
  return HEX_COLOR_RE.test(value) ? value : '#cccccc';
};

const createColor = async (req, res) => {
  try {
    const { name, hex } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Color name is required"
      });
    }

    const trimmedName = String(name).trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Color name must be between 2 and 50 characters"
      });
    }

    const existingColor = await Color.findOne({ name: trimmedName });

    if (existingColor) {
      return res.status(400).json({
        success: false,
        message: "Color already exists"
      });
    }

    const color = await Color.create({
      name: trimmedName,
      hex: normalizeHex(hex)
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
    const { name, hex } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Color name is required"
      });
    }

    const trimmedName = String(name).trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Color name must be between 2 and 50 characters"
      });
    }

    const updatedColor = await Color.findByIdAndUpdate(
      id,
      { name: trimmedName, hex: normalizeHex(hex) },
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