const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');

const { auth, isAdmin, isVendor } = require('../middleware/auth');
const {
  vendorLogin,
  getVendorProfile,
  updateVendorProfile,
  updateVendorProfileImage,
} = require('../controllers/vendor.controller');
const {
  createVendorByAdmin,
} = require('../controllers/vendorApplication.controller');

const { checkBlockedUser } = require('../middleware/checkBlockUser');



router.post('/login', vendorLogin);
router.post('/create', auth, isAdmin, createVendorByAdmin);

router.get('/profile', auth, getVendorProfile);
router.put('/profile-update',  auth, isVendor, checkBlockedUser,upload.single('profileImage'), updateVendorProfile);
router.post('/profile-image-update', auth, isVendor, checkBlockedUser, upload.single('profileImage'), updateVendorProfileImage);

module.exports = router;
