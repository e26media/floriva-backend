const Product = require('../Model/Product');
const Country = require('../Model/country');
const FeaturedProduct = require('../Model/FeaturedProduct');

// ─── Helper: parse FeaturedProduct IDs from multipart body ───────────────────
function parseFeaturedIds(body) {
  let ids = [];

  if (body.featuredProducts) {
    const raw = body.featuredProducts;
    if (Array.isArray(raw)) {
      ids = raw.filter(id => id && id.toString().trim() !== '');
    } else if (typeof raw === 'string' && raw.trim() !== '') {
      ids = [raw.trim()];
    }
  }

  if (body.featuredProductsJSON !== undefined) {
    try {
      const parsed = JSON.parse(body.featuredProductsJSON);
      if (Array.isArray(parsed)) {
        if (ids.length === 0) {
          ids = parsed.filter(id => id && id.toString().trim() !== '');
        }
        return { ids, wasProvided: true };
      }
    } catch (e) {
      console.warn('featuredProductsJSON parse error:', e.message);
    }
  }

  const wasProvided =
    body.featuredProducts !== undefined ||
    body.featuredProductsJSON !== undefined;

  return { ids, wasProvided };
}

// ─── Create Product ───────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    // ── THIS IS THE FIX ──────────────────────────────────────────────────────
    // NEVER use  const { name } = req.body  at the top.
    // When the request is multipart/form-data and multer is missing from the
    // route, req.body is undefined. Destructuring undefined throws:
    //   "Cannot destructure property 'name' of undefined"
    // Reading properties one-by-one is safe — undefined.name just returns
    // undefined instead of crashing.
    // ─────────────────────────────────────────────────────────────────────────
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message:
          'req.body is undefined. The route must include upload middleware: ' +
          'router.post("/insert", upload.array("images", 10), createProduct)',
      });
    }

    console.log('Request Body :', req.body);
    console.log('Request Files:', req.files);

    const name          = req.body.name;
    const title         = req.body.title;
    const description   = req.body.description   || '';
    const exactPrice    = req.body.exactPrice;
    const discountPrice = req.body.discountPrice  || null;
    const category      = req.body.category       || null;
    const subCategory   = req.body.subCategory    || null;
    const color         = req.body.color          || null;
    const country        = req.body.country         || null;
    const stock         = req.body.stock          || 0;
    const deliveryInfo  = req.body.deliveryInfo;

    // Validate
    if (!name || !title || !exactPrice || !deliveryInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, title, exactPrice, deliveryInfo',
      });
    }

    // Images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/products/${f.filename}`);
    }

    // Numerics
    const numericPrice    = parseFloat(exactPrice);
    const numericDiscount = discountPrice ? parseFloat(discountPrice) : null;
    const numericStock    = parseInt(stock, 10) || 0;

    // FeaturedProduct
    const { ids: featuredProductIds } = parseFeaturedIds(req.body);

    const productData = {
      name:            name.trim(),
      title:           title.trim(),
      description:     description.trim(),
      exactPrice:      numericPrice,
      discountPrice:   numericDiscount,
      category:        category ? category.toString().trim() : null,
      stock:           numericStock,
      deliveryInfo:    deliveryInfo.trim(),
      images,
      FeaturedProduct: featuredProductIds,
      // county:          county ? county.toString().trim() : null,
      // color:           color ? color.toString().trim() : null,
    };

    if (subCategory && subCategory.toString().trim() !== '') {
      productData.subCategory = subCategory.toString().trim();
    }
    if (color && color.toString().trim() !== '') {
      productData.color = color.toString().trim();
    }
    if (country && country.toString().trim() !== '') {
      productData.country = country.toString().trim();
    }

    const product   = new Product(productData);
    await product.save();

    const populated = await Product.findById(product._id)
      .populate('category')
      .populate('subCategory')
      .populate('color')
      .populate('FeaturedProduct')
      .populate('country');

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populated,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
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
      .populate('color')
      .populate('FeaturedProduct')
      .populate('country')

    return res.json({ success: true, data });
  } catch (err) {
    console.error('All product view failed:', err);
    return res.status(500).json({ success: false, message: 'All product view failed' });
  }
};


// particular data view
const particularView = async (req, res) => {
  try {
    const { country } = req.query;

    let query = {};

    // ✅ Country filter
    if (country) {
      const countryDoc = await Country.findOne({
        name: new RegExp(`^${country}$`, "i")
      });

      if (!countryDoc) {
        return res.json({ success: true, data: [] });
      }

      query.country = countryDoc._id;
    }

    // ✅ FeaturedProduct filter (SAFE CHECK)
    let featuredDoc = null;

    try {
      featuredDoc = await FeaturedProduct.findOne({
        name: "New Arrivals"
      });
    } catch (e) {
      console.log("FeaturedProduct error:", e.message);
    }

    if (featuredDoc) {
      query.FeaturedProduct = { $in: [featuredDoc._id] };
    }

    console.log("Final Query:", query); // 🔥 debug

    const data = await Product.find(query)
      .populate('category')
      .populate('subCategory')
      .populate('color')
      .populate('FeaturedProduct')
      .populate('country');

    return res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    console.error('ERROR FULL:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const countryWiseProducts = async (req, res) => {
  try {
    const { country } = req.query;

    let query = {};

    // ✅ Country filter
    if (country) {
      const countryDoc = await Country.findOne({
        name: new RegExp(`^${country}$`, "i")
      });

      if (!countryDoc) {
        return res.json({ success: true, data: [] });
      }

      query.country = countryDoc._id;
    }

    


    console.log("Final Query:", query); // 🔥 debug

    const data = await Product.find(query)
      .populate('category')
      .populate('subCategory')
      .populate('color')
      .populate('FeaturedProduct')
      .populate('country');

    return res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    console.error('ERROR FULL:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ─── Single Product View  GET /api/allFeaturedProducts/:id ───────────────────
const singleProductView = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category')
      .populate('subCategory')
      .populate('color')
      .populate('FeaturedProduct')
      .populate('country');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product });
  } catch (err) {
    console.error('Single product view failed:', err);
    return res.status(500).json({ success: false, message: 'Single product view failed' });
  }
};

// ─── Update Product  PUT /api/FeaturedProductUpdate/:id ──────────────────────
const productUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message:
          'req.body is undefined. The route must include upload middleware: ' +
          'router.put("/FeaturedProductUpdate/:id", upload.array("images", 10), productUpdate)',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 1️⃣ Scalar fields
    ['name', 'title', 'description', 'exactPrice', 'discountPrice', 'stock', 'deliveryInfo', 'category']
      .forEach(field => {
        if (req.body[field] !== undefined) product[field] = req.body[field];
      });

    // 2️⃣ subCategory
    if (req.body.subCategory !== undefined) {
      const sub = req.body.subCategory.toString().trim();
      product.subCategory = sub !== '' ? sub : null;
    }

    // 3️⃣ color
    if (req.body.color !== undefined) {
      const col = req.body.color.toString().trim();
      product.color = col !== '' ? col : null;
    }
    if (req.body.country !== undefined) {
      const cou = req.body.country.toString().trim();
      product.country = cou !== '' ? cou : null;
    }

    // 4️⃣ FeaturedProduct array
    const { ids: featuredIds, wasProvided } = parseFeaturedIds(req.body);
    if (wasProvided) {
      product.FeaturedProduct = featuredIds;
    }

    // 5️⃣ Images
    let existingImages = [];
    if (req.body.existingImages) {
      try { existingImages = JSON.parse(req.body.existingImages); } catch { existingImages = []; }
    }

    let finalImages = [...existingImages];
    if (req.files && req.files.length > 0) {
      finalImages.push(...req.files.map(f => `/uploads/products/${f.filename}`));
    }
    if (finalImages.length === 0) finalImages = product.images;

    product.images = finalImages;
    await product.save();

    const populated = await Product.findById(product._id)
      .populate('category')
      .populate('subCategory')
      .populate('color')
      .populate('FeaturedProduct')
      .populate('country');

    return res.json({ success: true, message: 'Product updated successfully', product: populated });
  } catch (err) {
    console.error('Product update failed:', err);
    return res.status(500).json({ success: false, message: 'Product update failed' });
  }
};

// ─── Delete Product ───────────────────────────────────────────────────────────
const productDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Product delete failed:', err);
    return res.status(500).json({ success: false, message: 'Product delete failed' });
  }
};

module.exports = { createProduct, productView, singleProductView, productUpdate, productDelete,particularView,countryWiseProducts };