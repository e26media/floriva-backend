// categoryRoutes 

const express =require('express');
const { createCategory, updateCategory, getAllCategories, getCategoryById, deleteCategory } = require('../Controllers/categoryController');
const { categoryUpload } = require('../Middlewares/multer');
const { authenticateAdmin } = require('../Middlewares/adminAuth');
const router=express.Router();

router.post('/categoryinsert', authenticateAdmin, categoryUpload, createCategory);
router.get('/categoryview',getAllCategories);
router.get('/categoryview/:id',getCategoryById);
router.put('/categoryupdate/:id', authenticateAdmin, categoryUpload, updateCategory);
router.delete('/categorydelete/:id', authenticateAdmin, deleteCategory)

module.exports=router;
