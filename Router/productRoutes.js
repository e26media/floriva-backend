const express = require('express');
const router = express.Router();
const { createProduct, productView, singleProductView, productUpdate, productDelete } = require('../Controllers/productController');
const { arrayUpload } = require('../Middlewares/multer'); // Import the correct middleware

// Create product route with file upload middleware
router.post('/insert', arrayUpload, createProduct);
router.get('/productview',productView);
router.get('/productview/:id',singleProductView)
router.put('/productupdate/:id',arrayUpload,productUpdate);
router.delete('/productdelete/:id',productDelete);

module.exports = router;