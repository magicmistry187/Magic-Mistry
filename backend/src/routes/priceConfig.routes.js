const express = require('express');
const router = express.Router();

const {
  getFuelPricing,
  updateFuelPricing,
} = require('../controllers/pricingConfig.controller');

// Replace these with your project's actual authentication
// and admin authorization middleware.
const { auth, isAdmin } = require('../middleware/auth');

router.get('/fuel', getFuelPricing);

router.put('/fuel', auth, isAdmin, updateFuelPricing);

module.exports = router;
