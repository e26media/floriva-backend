const express = require('express');
const router  = express.Router();

const {
  addToCart,
  viewCart,
  updateCart,
  deleteCart,
  confirmOrder
} = require('../Controllers/cartController');
const { authenticateUser, requireMatchingEmail } = require('../Middlewares/userAuth');

router.post('/addtocart', authenticateUser, addToCart);
router.get('/view/:userEmail', authenticateUser, requireMatchingEmail, viewCart);
router.put('/cartupdate/:id', authenticateUser, updateCart);
router.delete('/cartdelete/:id', authenticateUser, deleteCart);
router.post('/confirm-order', authenticateUser, confirmOrder);

// Legacy aliases — avoid using /update/:id (conflicts with color routes)
router.put('/update/:id', authenticateUser, updateCart);

module.exports = router;