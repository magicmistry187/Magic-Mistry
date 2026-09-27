const express = require('express');
const router = express.Router();



const { auth } = require("../middleware/auth");
const {
  signup,
  sendOtp,
  login,
  googleLogin,
  logout,
  changePassword,
  verifyOtpForForgotPassword,
  forgotPassword,
} = require("../controllers/auth.controller");

const {
  loginLimiter,
  otpLimiter,
} = require('../middleware/rateLimiter');

const {
  updateUserLocation,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/user.controller");

/////////// api routes
router.post('/signup', signup);
router.post('/sendOtp', otpLimiter, sendOtp);
router.post('/login', loginLimiter, login);
router.post('/googleLogin', googleLogin);
router.post('/logout', logout);
router.get('/logout', logout);
router.post('/changePassword', auth, changePassword);
router.post('/forgotPassword/verifyOtp', verifyOtpForForgotPassword);
router.post('/forgotPassword', forgotPassword);


// -------------User controller routes-----------------
router.put('/update-location', auth, updateUserLocation);
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

module.exports = router;