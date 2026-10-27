const express = require('express');
const router = express.Router();
const {
  getActiveBanner,
  getAdminBanner,
  updateAdminBanner,
  toggleBannerActive,
} = require('../controllers/banner.controller');
const { auth, isAdmin } = require('../middleware/auth');

// Public route for landing page & customer app
router.get('/active', getActiveBanner);

// Quick 1-tap toggle route (instant on/off)
router.patch('/toggle', toggleBannerActive);

// Protected Admin routes
router.get('/admin', auth, isAdmin, getAdminBanner);
router.put('/admin', auth, isAdmin, updateAdminBanner);
router.patch('/admin/toggle', auth, isAdmin, toggleBannerActive);

module.exports = router;
