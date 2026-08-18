const express = require('express');
const router = express.Router();



const { auth } = require("../middleware/auth");
const {
  signup,
  sendOtp,
  login,
  googleLogin,
  changePassword,
  verifyOtpForForgotPassword,
  forgotPassword,
  updateUserLocation,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/auth.controller");

/////////// api routes
router.post('/signup', signup);
router.post('/sendOtp', sendOtp);
router.post('/login', login);
router.post('/googleLogin', googleLogin);
router.post('/changePassword', auth, changePassword);
router.post('/forgotPassword/verifyOtp', verifyOtpForForgotPassword);
router.post('/forgotPassword', forgotPassword);
router.put('/update-location', auth, updateUserLocation);
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

module.exports = router;