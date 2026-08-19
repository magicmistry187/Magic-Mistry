const express = require('express');
const router = express.Router();

const { auth, isAdmin, isVendor } = require('../middleware/auth');
const {
  vendorLogin,
  createVendorByAdmin,
  getVendorProfile,
} = require('../controllers/vendor.controller');

router.post('/login', vendorLogin);
router.post('/create', auth, isAdmin, createVendorByAdmin);

router.get('/profile', auth, getVendorProfile);

module.exports = router;
