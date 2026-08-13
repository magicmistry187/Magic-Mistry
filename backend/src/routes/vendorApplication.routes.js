const express = require('express');
const router = express.Router();

const documentUpload = require('../middleware/documentUpload');
const { auth, isAdmin } = require('../middleware/auth');

const {
  createVendorApplication,
  getAllVendorApplications,
  getVendorApplicationById,
  approveVendorApplication,
  rejectVendorApplication,
} = require('../controllers/vendorApplication.controller');

router.post(
  '/apply',
  documentUpload.array('documents', 5),
  createVendorApplication,
);

router.get('/', auth, isAdmin, getAllVendorApplications);

router.get('/:applicationId', auth, isAdmin, getVendorApplicationById);

router.patch('/:applicationId/reject', auth, isAdmin, rejectVendorApplication);

router.patch(
  '/:applicationId/approve',
  auth,
  isAdmin,
  approveVendorApplication,
);

module.exports = router;
