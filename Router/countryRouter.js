const express = require('express');
const {createCountry, getAllCountries, getSingleCountry, updateCountry, deleteCountry } = require('../Controllers/countryController');
const router = express.Router();


router.post('/insertCountry',createCountry); 
router.get('/allCountries',getAllCountries);
router.get('/allCountries/:id',getSingleCountry);
router.put('/updateCountry/:id',updateCountry);
router.delete('/deleteCountry/:id',deleteCountry);

module.exports = router;