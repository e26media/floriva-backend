const Cart = require('../Model/Cart');


// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { userEmail, productId, quantity = 1 } = req.body;

    if (!userEmail || !productId) {
      return res.status(400).json({
        success: false,
        message: "userEmail and productId required"
      });
    }

    // Only look for existing PENDING item (don't merge with already-ordered items)
    const existing = await Cart.findOne({ userEmail, productId, status: "pending" });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json({ success: true, message: "Cart updated", data: existing });
    }

    const cartItem = new Cart({
      userEmail,
      productId,
      quantity,
      status: "pending"
    });

    await cartItem.save();

    res.json({ success: true, message: "Added to cart", data: cartItem });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// VIEW CART — only returns "pending" items (ordered items will NOT appear)
const viewCart = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const items = await Cart.find({
      userEmail,
      status: "pending"          // ← KEY: only pending items shown in cart
    }).populate("productId");

    res.json({ success: true, data: items });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// UPDATE CART QUANTITY
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const updated = await Cart.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    ).populate("productId");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    res.json({ success: true, message: "Cart updated", data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// DELETE CART ITEM
const deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Cart.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    res.json({ success: true, message: "Cart item deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// CONFIRM ORDER
// Called after order is successfully placed.
// Changes all "pending" cart items for this user → "success"
// This causes the cart page to show empty (it only queries "pending").
const confirmOrder = async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "userEmail is required" });
    }

    const result = await Cart.updateMany(
      { userEmail, status: "pending" },
      { $set: { status: "success" } }
    );

    res.json({
      success: true,
      message: "Order confirmed — cart cleared",
      updated: result.modifiedCount
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  addToCart,
  viewCart,
  updateCart,
  deleteCart,
  confirmOrder
};