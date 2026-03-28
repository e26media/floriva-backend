const express = require('express');
const { createFeaturedProduct, getAllFeaturedProducts, getSingleFeaturedProduct, updateFeaturedProduct, deleteFeaturedProduct } = require('../Controllers/featuredController');
const router = express.Router();


router.post('/insertFeaturedProductsss',createFeaturedProduct);
router.get('/allFeaturedProducts',getAllFeaturedProducts);
router.get('/allFeaturedProducts/:id',getSingleFeaturedProduct);
router.put('/FeaturedProductUpdate/:id',updateFeaturedProduct);
router.delete('/featuredProductDelete/:id',deleteFeaturedProduct);









module.exports = router;