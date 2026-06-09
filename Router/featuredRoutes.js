const express = require('express');
const { createFeaturedProduct, getAllFeaturedProducts, getSingleFeaturedProduct, updateFeaturedProduct, deleteFeaturedProduct } = require('../Controllers/featuredController');
const { authenticateAdmin } = require('../Middlewares/adminAuth');
const router = express.Router();

router.post('/insertFeaturedProduct', authenticateAdmin, createFeaturedProduct);
router.get('/allFeaturedProducts',getAllFeaturedProducts);
router.get('/allFeaturedProducts/:id',getSingleFeaturedProduct);
router.put('/FeaturedProductUpdate/:id', authenticateAdmin, updateFeaturedProduct);
router.delete('/featuredProductDelete/:id', authenticateAdmin, deleteFeaturedProduct);









module.exports = router;