const express = require('express');

const {
  getVendorEarnings,
  getVendorEarningById,
  getAllVendorEarnings,
  getAllVendorEarningsByVendor,
} = require('../controllers/vendorEarning.controller');

const { auth, isVendor, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all earnings of the logged-in vendor
router.get(
  '/vendor',
  auth,
  isVendor,
  getVendorEarnings
);

// Get one earning of the logged-in vendor
router.get(
  '/vendor/:id',
  auth,
  isVendor,
  getVendorEarningById
);

// Get all vendor earnings
router.get(
  '/admin',
  auth,
  isAdmin,
  getAllVendorEarnings
);

// Get all earnings of a specific vendor
router.get(
  '/admin/vendor/:vendorId',
  auth,
  isAdmin,
  getAllVendorEarningsByVendor
);

module.exports = router;