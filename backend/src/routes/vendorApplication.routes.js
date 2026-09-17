const express = require('express');
const router = express.Router();

const documentUpload = require('../middleware/documentUpload');
const { auth, isAdmin } = require('../middleware/auth');

const {
  createVendorApplication,
  getAllVendorApplications,
  getVendorApplicationById,
  approveVendorApplication,
  getVendorCredentials,
  rejectVendorApplication,
  createVendorByAdmin,
} = require('../controllers/vendorApplication.controller');

const { vendorApplicationLimiter } = require('../middleware/rateLimiter');

router.post(
  '/apply',
  vendorApplicationLimiter,
  documentUpload.array('documents', 5),
  createVendorApplication,
);

router.post('/create', auth, isAdmin, createVendorByAdmin);

router.get('/', auth, isAdmin, getAllVendorApplications);

router.get('/:applicationId/credentials', auth, isAdmin, getVendorCredentials);

router.patch('/:applicationId/reject', auth, isAdmin, rejectVendorApplication);

router.patch(
  '/:applicationId/approve',
  auth,
  isAdmin,
  approveVendorApplication,
);

router.get('/:applicationId', auth, isAdmin, getVendorApplicationById);

module.exports = router;
