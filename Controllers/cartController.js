const Product = require('../Model/Product');
const Cart = require('../Model/Cart');
const { normalizeStoreCountrySlug } = require('../Utils/geoCountry');

async function getProductCountrySlug(productId) {
  const product = await Product.findById(productId).populate('country', 'name').lean();
  if (!product?.country) return null;
  const name = typeof product.country === 'object' ? product.country.name : product.country;
  return normalizeStoreCountrySlug(name);
}

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userEmail = String(
      req.user?.cartKey || req.user?.email || req.user?.phone || req.body.userEmail || "",
    ).trim().toLowerCase();

    if (!userEmail || !productId) {
      return res.status(400).json({
        success: false,
        message: 'productId and authenticated user are required',
      });
    }

    if (
      req.user?.cartKey &&
      req.body.userEmail &&
      String(req.body.userEmail).trim().toLowerCase() !== req.user.cartKey
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only add items to your own cart',
      });
    }

    const userCountry = normalizeStoreCountrySlug(req.user?.countrySlug);
    const productCountry = await getProductCountrySlug(productId);

    if (userCountry && productCountry && userCountry !== productCountry) {
      return res.status(403).json({
        success: false,
        message: `This product is only available in ${productCountry}. Your store region is ${userCountry}.`,
        userCountry,
        productCountry,
      });
    }

    const existing = await Cart.findOne({ userEmail, productId, status: 'pending' });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json({ success: true, message: 'Cart updated', data: existing });
    }

    const cartItem = new Cart({
      userEmail,
      productId,
      quantity,
      status: 'pending',
    });

    await cartItem.save();

    res.json({ success: true, message: 'Added to cart', data: cartItem });
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
      status: "pending"
    }).populate({
      path: 'productId',
      populate: [
        { path: 'color', select: 'name' },
        { path: 'category', select: 'name' },
        { path: 'country', select: 'name' },
      ],
    });

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

    if (updated.userEmail !== req.user?.cartKey) {
      return res.status(403).json({ success: false, message: "You can only update your own cart" });
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

    const existing = await Cart.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    if (existing.userEmail !== req.user?.cartKey) {
      return res.status(403).json({ success: false, message: "You can only delete your own cart items" });
    }

    await Cart.findByIdAndDelete(id);

    res.json({ success: true, message: "Cart item deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CONFIRM ORDER
const confirmOrder = async (req, res) => {
  try {
    const userEmail = String(req.user?.cartKey || req.user?.email || req.user?.phone || req.body.userEmail || "").trim().toLowerCase();

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
