const express = require('express');
const { createColor, getAllColors, getSingleColor, updateColor, deleteColor } = require('../Controllers/colorController');
const router = express.Router();


router.post('/insertColor',createColor);
router.get('/allColors',getAllColors);
router.get('/allColors/:id',getSingleColor);
router.put('/update/:id',updateColor);
router.delete('/delete/:id',deleteColor);









module.exports = router;