const mongoose = require('mongoose');
const { Schema } = mongoose;

const subCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: true });

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    categoriesimg: {
        type: String,   // URL or path to the category image
        trim: true
    },
    subCategories: [subCategorySchema]  // Array of subcategories
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
