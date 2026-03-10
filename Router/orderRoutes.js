// ─── Routes/orderRouter.js ────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const {
  createOrder,
  confirmOnlinePayment,
  orderView,
  orderSingleView,
  orderViewByUser,
  orderUpdate,
  orderDelete,
} = require('../Controllers/orderController');

// ── Create order (COD or Online) ─────────────────────────────────────────────
router.post('/createorder', createOrder);

// ── Confirm Stripe payment after frontend stripe.confirmPayment() ─────────────
router.post('/confirm-payment', confirmOnlinePayment);

// ── View all orders (admin) ───────────────────────────────────────────────────
router.get('/orderview', orderView);

// ── View single order ─────────────────────────────────────────────────────────
router.get('/orderview/:id', orderSingleView);

// ── View all orders for a user by email ──────────────────────────────────────
router.get('/user/:email', orderViewByUser);

// ── Update order status / paymentStatus ──────────────────────────────────────
router.put('/orderupdates/:id', orderUpdate);

// ── Cancel / delete order ─────────────────────────────────────────────────────
router.delete('/orderdelete/:id', orderDelete);

module.exports = router;

// ─────────────────────────────────────────────────────────────────────────────
// In your main app.js / server.js, mount this router:
//
//   const orderRouter = require('./Routes/orderRouter');
//   app.use('/api/order', orderRouter);
//
// This gives you:
//   POST   /api/order/createorder
//   POST   /api/order/confirm-payment
//   GET    /api/order/orderview
//   GET    /api/order/orderview/:id
//   GET    /api/order/user/:email
//   PUT    /api/order/orderupdates/:id
//   DELETE /api/order/orderdelete/:id
// ─────────────────────────────────────────────────────────────────────────────