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
      ref: 'Category', // Foreign Key
      // required: true
    },
     subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
          },
            
 color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color'
  },
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

module.exports = mongoose.model("Product", productSchema);