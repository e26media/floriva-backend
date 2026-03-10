const Product = require('../Model/Product');

// ─── Create Product ───────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);

    const {
      name,
      title,
      description,
      exactPrice,
      discountPrice,
      category,
      subCategory,
      color,
      stock,
      deliveryInfo,
    } = req.body;

    // Validate required fields
    if (!name || !title || !exactPrice || !deliveryInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, title, exactPrice, and deliveryInfo are required',
      });
    }

    // Handle images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    // Parse numeric fields
    const numericPrice    = parseFloat(exactPrice);
    const numericDiscount = discountPrice ? parseFloat(discountPrice) : null;
    const numericStock    = stock ? parseInt(stock) : 0;

    // Build product object
    const productData = {
      name:          name.trim(),
      title:         title.trim(),
      description:   description ? description.trim() : '',
      exactPrice:    numericPrice,
      discountPrice: numericDiscount,
      category:      category ? category.trim() : null,
      stock:         numericStock,
      deliveryInfo:  deliveryInfo.trim(),
      images,
    };

    // Only set subCategory if provided
    if (subCategory && subCategory.trim() !== '') {
      productData.subCategory = subCategory.trim();
    }

    // Only set color if provided
    if (color && color.toString().trim() !== '') {
      productData.color = color.toString().trim();
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// ─── View All Products ────────────────────────────────────────────────────────
const productView = async (req, res) => {
  try {
    const data = await Product.find()
      .populate('category')
      .populate('subCategory')
      .populate('color');

    res.json({ success: true, data });
  } catch (err) {
    console.error('All product view failed:', err);
    res.status(500).json({ success: false, message: 'All product view failed' });
  }
};

// ─── Single Product View ──────────────────────────────────────────────────────
const singleProductView = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category')
      .populate('subCategory')
      .populate('color');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error('Single product view failed:', err);
    res.status(500).json({ success: false, message: 'Single product view failed' });
  }
};

// ─── Update Product ───────────────────────────────────────────────────────────
const productUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 1️⃣ Update scalar fields
    const scalarFields = [
      'name',
      'title',
      'description',
      'exactPrice',
      'discountPrice',
      'stock',
      'deliveryInfo',
      'category',
    ];

    scalarFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // 2️⃣ Handle subCategory
    if (req.body.subCategory !== undefined) {
      const sub = req.body.subCategory.toString().trim();
      product.subCategory = sub !== '' ? sub : null;
    }

    // 3️⃣ Handle color
    // - If sent and non-empty → save it
    // - If sent as empty string → clear it
    // - If not sent at all → leave existing value untouched
    if (req.body.color !== undefined) {
      const col = req.body.color.toString().trim();
      product.color = col !== '' ? col : null;
    }

    // 4️⃣ Handle image reorder + new uploads
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
      } catch {
        existingImages = [];
      }
    }

    let finalImages = [...existingImages];

    // Append newly uploaded files after existing ones
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      finalImages.push(...newImages);
    }

    // If nothing was sent (no reorder, no new files) → keep original images
    if (finalImages.length === 0) {
      finalImages = product.images;
    }

    product.images = finalImages;

    await product.save();

    // Return populated product so the frontend gets full references
    const populated = await Product.findById(product._id)
      .populate('category')
      .populate('subCategory')
      .populate('color');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: populated,
    });
  } catch (err) {
    console.error('Product update failed:', err);
    res.status(500).json({ success: false, message: 'Product update failed' });
  }
};

// ─── Delete Product ───────────────────────────────────────────────────────────
const productDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Product delete failed:', err);
    res.status(500).json({ success: false, message: 'Product delete failed' });
  }
};

module.exports = {
  createProduct,
  productView,
  singleProductView,
  productUpdate,
  productDelete,
};