const express = require('express');
const router  = express.Router();

const {
  addToCart,
  viewCart,
  updateCart,
  deleteCart,
  confirmOrder
} = require('../Controllers/cartController');

// Add item to cart
router.post('/addtocart', addToCart);

// View all pending cart items for a user
// GET /api/view/:userEmail
router.get('/view/:userEmail', viewCart);

// Update quantity of a cart item
// PUT /api/cartupdate/:id  (body: { quantity })
// NOTE: your cart.jsx uses /api/update/:id — pick ONE and use consistently
router.put('/update/:id', updateCart);
router.put('/cartupdate/:id', updateCart);   // alias kept for compatibility

// Delete a single cart item
// DELETE /api/cartdelete/:id
router.delete('/cartdelete/:id', deleteCart);

// Confirm order — sets all pending items → "success" (clears cart)
// POST /api/confirm-order  (body: { userEmail })
router.post('/confirm-order', confirmOrder);

module.exports = router;