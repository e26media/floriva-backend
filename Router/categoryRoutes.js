// categoryRoutes 

const express =require('express');
const { createCategory, updateCategory, getAllCategories, getCategoryById, deleteCategory } = require('../Controllers/categoryController');
const { categoryUpload } = require('../Middlewares/multer');
const { authenticateAdmin } = require('../Middlewares/adminAuth');
const router=express.Router();

const handleCategoryUpload = (req, res, next) => {
  categoryUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid category image upload',
      });
    }
    next();
  });
};

router.post('/categoryinsert', authenticateAdmin, handleCategoryUpload, createCategory);
router.get('/categoryview',getAllCategories);
router.get('/categoryview/:id',getCategoryById);
router.put('/categoryupdate/:id', authenticateAdmin, handleCategoryUpload, updateCategory);
router.delete('/categorydelete/:id', authenticateAdmin, deleteCategory)

module.exports=router;
