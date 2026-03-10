// Controllers/orderController.js
//
// Supports two payment methods:
//   1. cash_on_delivery  ->  order saved, paymentStatus = 'unpaid'
//   2. online            ->  Stripe PaymentIntent created, client gets clientSecret
//                           frontend confirms, then calls /confirm-payment
//
// .env required:
//   STRIPE_SECRET_KEY=sk_test_...   (only needed for online payments)
//
// server.js must have this as the FIRST line:
//   require('dotenv').config();

const Product = require('../Model/Product');
const Order   = require('../Model/Order');
const Stripe  = require('stripe');

const { sendOrderEmail, sendCancelEmail } = require('../Config/sendEmail');

// Stripe is created lazily (on first online payment request).
// This means COD works perfectly even if STRIPE_SECRET_KEY is not set.
// It also fixes the "Neither apiKey provided" crash on startup.
let _stripe = null;
function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set in your .env file. ' +
        'Cash on Delivery still works without it.'
      );
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

// ---------------------------------------------------------------------------
// Helper: check stock for all items, then reduce if all pass
// ---------------------------------------------------------------------------
async function validateAndReduceStock(products) {
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw { status: 404, message: 'Product not found: ' + item.product };
    }
    if (item.quantity > product.stock) {
      throw {
        status: 400,
        message: 'Only ' + product.stock + ' item(s) in stock for "' + product.name + '"',
      };
    }
  }
  for (const item of products) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
}

// ---------------------------------------------------------------------------
// Helper: restore stock (on cancel or payment failure)
// ---------------------------------------------------------------------------
async function restoreStock(products) {
  for (const item of products) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
}

// ---------------------------------------------------------------------------
// POST /api/order/createorder
//
// Body:
//   products        : [{ product: "<mongoId>", quantity: <n> }]
//   totalAmount     : number
//   shippingAddress : { streetAddress1, streetAddress2, city, stateProvinceRegionId, postalCode, country }
//   userEmail       : string
//   paymentMethod   : "cash_on_delivery" | "online"
//
// Response (COD):
//   { success: true, message, order }
//
// Response (online):
//   { success: true, message, order, clientSecret, orderId }
// ---------------------------------------------------------------------------
const createOrder = async (req, res) => {
  try {
    const {
      products,
      totalAmount,
      shippingAddress,
      userEmail,
      paymentMethod = 'cash_on_delivery',
    } = req.body;

    // Basic validation
    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Products are required' });
    }
    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'userEmail is required' });
    }
    if (
      !shippingAddress ||
      !shippingAddress.streetAddress1 ||
      !shippingAddress.city ||
      !shippingAddress.stateProvinceRegionId ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }
    if (!['cash_on_delivery', 'online'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid paymentMethod' });
    }

    // Check stock and reduce
    await validateAndReduceStock(products);

    // -----------------------------------------------------------------------
    // CASH ON DELIVERY
    // -----------------------------------------------------------------------
    if (paymentMethod === 'cash_on_delivery') {
      const order = new Order({
        products,
        totalAmount,
        shippingAddress,
        userEmail,
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'unpaid',
        status: 'pending',
      });

      await order.save();

      try {
        await sendOrderEmail(userEmail, order._id, totalAmount);
      } catch (emailErr) {
        console.error('[Order] Email failed (non-fatal):', emailErr.message);
      }

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully (Cash on Delivery)',
        order,
      });
    }

    // -----------------------------------------------------------------------
    // ONLINE PAYMENT (Stripe)
    // -----------------------------------------------------------------------
    if (paymentMethod === 'online') {
      const amountInCents = Math.round(totalAmount * 100);

      const paymentIntent = await getStripe().paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: { userEmail },
        automatic_payment_methods: { enabled: true },
      });

      const order = new Order({
        products,
        totalAmount,
        shippingAddress,
        userEmail,
        paymentMethod: 'online',
        paymentStatus: 'unpaid',
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
      });

      await order.save();

      return res.status(201).json({
        success: true,
        message: 'Order created. Complete payment on frontend.',
        order,
        clientSecret: paymentIntent.client_secret,
        orderId: order._id,
      });
    }

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('[Order] createOrder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Order creation failed: ' + error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/order/confirm-payment
//
// Called after Stripe payment succeeds on the frontend
// Body: { orderId, paymentIntentId }
// ---------------------------------------------------------------------------
const confirmOnlinePayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ success: false, message: 'orderId and paymentIntentId are required' });
    }

    const intent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed. Stripe status: ' + intent.status,
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'paid', status: 'processing', stripePaymentIntentId: paymentIntentId },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    try {
      await sendOrderEmail(order.userEmail, order._id, order.totalAmount);
    } catch (emailErr) {
      console.error('[Order] Email failed (non-fatal):', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment confirmed. Order is now processing.',
      order,
    });

  } catch (error) {
    console.error('[Order] confirmPayment error:', error);
    return res.status(500).json({ success: false, message: 'Payment confirmation failed: ' + error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/order/orderview — all orders (admin)
// ---------------------------------------------------------------------------
const orderView = async (req, res) => {
  try {
    const data = await Order.find();

    res.json({ success: true, data });

  } catch (err) {
    console.error('All order view failed:', err);
    res.status(500).json({
      success: false,
      message: 'All order view failed'
    });
  }
};
// ---------------------------------------------------------------------------
// GET /api/order/orderview/:id — single order
// ---------------------------------------------------------------------------
const orderSingleView = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve order', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/order/user/:email — all orders for a user
// ---------------------------------------------------------------------------
const orderViewByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.params.email })
      .populate('products.product')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user orders', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/order/orderupdates/:id — update status / paymentStatus
// ---------------------------------------------------------------------------
const orderUpdate = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status)        order.status        = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json({ success: true, message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Order update failed', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/order/orderdelete/:id — cancel order
// ---------------------------------------------------------------------------
const orderDelete = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await restoreStock(order.products);

    // If paid online, refund via Stripe
    if (order.paymentMethod === 'online' && order.paymentStatus === 'paid' && order.stripePaymentIntentId) {
      try {
        await getStripe().refunds.create({ payment_intent: order.stripePaymentIntentId });
      } catch (stripeErr) {
        console.error('[Order] Stripe refund failed:', stripeErr.message);
      }
    }

    try {
      await sendCancelEmail(order.userEmail, order._id);
    } catch (emailErr) {
      console.error('[Order] Cancel email failed (non-fatal):', emailErr.message);
    }

    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Order delete failed', error: error.message });
  }
};

module.exports = {
  createOrder,
  confirmOnlinePayment,
  orderView,
  orderSingleView,
  orderViewByUser,
  orderUpdate,
  orderDelete,
};