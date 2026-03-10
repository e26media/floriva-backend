const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    userEmail: {
      type: String,
      required: true
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    // "pending"  = item is in the cart, waiting for checkout
    // "success"  = order has been placed, item no longer shown in cart
    status: {
      type: String,
      enum: ["pending", "success"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);