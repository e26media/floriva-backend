const express = require('express');
const {createCountry, getAllCountries, getSingleCountry, updateCountry, deleteCountry } = require('../Controllers/countryController');
const { authenticateAdmin } = require('../Middlewares/adminAuth');
const router = express.Router();

router.post('/insertCountry', authenticateAdmin, createCountry); 
router.get('/allCountries',getAllCountries);
router.get('/allCountries/:id',getSingleCountry);
router.put('/updateCountry/:id', authenticateAdmin, updateCountry);
router.delete('/deleteCountry/:id', authenticateAdmin, deleteCountry);

module.exports = router;