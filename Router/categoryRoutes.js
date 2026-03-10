// categoryRoutes 

const express =require('express');
const { createCategory, updateCategory, getAllCategories, getCategoryById, deleteCategory } = require('../Controllers/categoryController');
const router=express.Router();

router.post('/categoryinsert',createCategory);
router.get('/categoryview',getAllCategories);
router.get('/categoryview/:id',getCategoryById);
router.put('/categoryupdate/:id',updateCategory);
router.delete('/categorydelete/:id',deleteCategory)

module.exports=router;
