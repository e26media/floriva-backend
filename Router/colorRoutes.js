const express = require('express');
const { createColor, getAllColors, getSingleColor, updateColor, deleteColor } = require('../Controllers/colorController');
const { authenticateAdmin } = require('../Middlewares/adminAuth');
const router = express.Router();

router.post('/insertColor', authenticateAdmin, createColor);
router.get('/allColors', getAllColors);
router.get('/allColors/:id', getSingleColor);
router.put('/colorupdate/:id', authenticateAdmin, updateColor);
router.delete('/colordelete/:id', authenticateAdmin, deleteColor);
router.put('/update/:id', authenticateAdmin, updateColor);
router.delete('/delete/:id', authenticateAdmin, deleteColor);









module.exports = router;