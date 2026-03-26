const Country = require('../Model/country');


const createCountry = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Country name is required"
      });
    }

    const existingCountry = await Country.findOne({ name: name.trim() });

    if (existingCountry) {
      return res.status(400).json({
        success: false,
        message: "Country already exists"
      });
    }

    const country = await Country.create({
      name: name.trim()
    });

    res.status(201).json({
      success: true,
      message: "Country created successfully",
      data: country
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: countries
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const getSingleCountry = async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findById(id);

    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found"
      });
    }

    res.status(200).json({
      success: true,
      data: country
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Country name is required"
      });
    }

    const updatedCountry = await Country.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updatedCountry) {
      return res.status(404).json({
        success: false,
        message: "Country not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Country updated successfully",
      data: updatedCountry
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCountry = await Country.findByIdAndDelete(id);

    if (!deletedCountry) {
      return res.status(404).json({
        success: false,
        message: "Country not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Country deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



module.exports = {
  createCountry,
  getAllCountries,
  getSingleCountry,
  updateCountry,
  deleteCountry
};