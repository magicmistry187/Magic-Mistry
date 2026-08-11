const express = require('express');
const router = express.Router();

const documentUpload = require('../middleware/documentUpload');

const {
  createVendorApplication,
} = require('../controllers/vendorApplicationController');

router.post(
  '/apply',
  documentUpload.array('documents', 5),
  createVendorApplication,
);

module.exports = router;
