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
const { authenticateAdmin } = require('../Middlewares/adminAuth');
const { authenticateUser, requireMatchingEmail } = require('../Middlewares/userAuth');

router.post('/createorder', createOrder);
router.post('/confirm-payment', confirmOnlinePayment);
router.get('/orderview', authenticateAdmin, orderView);
router.get('/orderview/:id', authenticateAdmin, orderSingleView);
router.get('/user/:email', authenticateUser, requireMatchingEmail, orderViewByUser);
router.put('/orderupdates/:id', authenticateAdmin, orderUpdate);
router.delete('/orderdelete/:id', authenticateAdmin, orderDelete);

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