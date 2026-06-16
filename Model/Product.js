 const mongoose =require('mongoose');
const {Schema} =mongoose;

const productSchema = new  Schema({
  
    name: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    exactPrice: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Primary category (first in categories[])
      // required: true
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
     subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
          },
            
 color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color'
  },
 country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  },
 FeaturedProduct: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeaturedProduct',
  }
],
    stock: {
      type: Number,
      default: 0
    },
    deliveryInfo: {
      type: String,
      required: true
    },
     userEmail: {
    type: String,
  },
    images: [{
      type: String,
      default: []
    }]
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (Array.isArray(this.categories) && this.categories.length > 0) {
    this.category = this.categories[0];
  } else if (this.category && (!this.categories || this.categories.length === 0)) {
    this.categories = [this.category];
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);