// src/routes/country.routes.js
const express = require('express');
const router = express.Router();
const countryController = require('../controllers/country.controller');

// --- Main refresh route ---
router.post('/countries/refresh', countryController.refreshCountries);

// --- New GET, DELETE, and Status routes ---


router.get('/countries', countryController.getAllCountries);

// --- New route for serving the image ---
router.get('/countries/image', countryController.serveSummaryImage);

router.get('/countries/:name', countryController.getCountryByName);
router.delete('/countries/:name', countryController.deleteCountryByName);
router.get('/status', countryController.getStatus);



module.exports = router;