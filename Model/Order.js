// ─── Model/Order.js ───────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    // ── Payment ────────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'online'],
      required: true,
      default: 'cash_on_delivery',
    },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },

    // Stripe fields (only used when paymentMethod === 'online')
    stripePaymentIntentId: {
      type: String,
      default: null,
    },

    stripeClientSecret: {
      type: String,
      default: null,
    },

    // ── Shipping Address (matches your schema) ─────────────────────────────────
    shippingAddress: {
      streetAddress1:        { type: String, required: true },
      streetAddress2:        { type: String, default: '' },
      city:                  { type: String, required: true },
      stateProvinceRegionId: { type: String, required: true },
      postalCode:            { type: String, required: true },
      country:               { type: String, required: true },
    },

    userEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);