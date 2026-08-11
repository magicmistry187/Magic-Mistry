const express = require('express');
const router = express.Router();

const documentUpload = require('../middleware/documentUpload');

const {
  createVendorApplication,
} = require('../controllers/vendorApplication.controller');

router.post(
  '/apply',
  documentUpload.array('documents', 5),
  createVendorApplication,
);

module.exports = router;
