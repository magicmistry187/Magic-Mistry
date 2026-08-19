const express = require('express');
const router = express.Router();

const { auth, isAdmin } = require('../middleware/auth');
const { vendorLogin } = require('../controllers/vendor.controller');
const { createVendorByAdmin } = require('../controllers/vendorApplication.controller');

router.post('/login', vendorLogin);
router.post('/create', auth, isAdmin, createVendorByAdmin);

module.exports = router;
