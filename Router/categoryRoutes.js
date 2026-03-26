// categoryRoutes 

const express =require('express');
const { createCategory, updateCategory, getAllCategories, getCategoryById, deleteCategory } = require('../Controllers/categoryController');
const { singleUpload, categoryUpload } = require('../Middlewares/multer');
const router=express.Router();

router.post('/categoryinsert',categoryUpload,createCategory);
router.get('/categoryview',getAllCategories);
router.get('/categoryview/:id',getCategoryById);
router.put('/categoryupdate/:id',categoryUpload,updateCategory);
router.delete('/categorydelete/:id',deleteCategory)

module.exports=router;
