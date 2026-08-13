const express = require('express');
const router = express.Router();



// const { auth, isCustomer, isVendor, isAdmin, authorizeRoles } = require("../middleware/auth");
const {
  signup,
  sendOtp,
  login,
  googleLogin,
  changePassword,
  verifyOtpForForgotPassword,
  forgotPassword,
} = require("../controllers/auth.controller");


/////////// api routes
router.post('/signup', signup);
router.post('/sendOtp',sendOtp)
router.post('/login',login)
router.post('/googleLogin',googleLogin)
router.post('/changePassword', changePassword);
router.post('/forgotPassword/verifyOtp', verifyOtpForForgotPassword);
router.post('/forgotPassword', forgotPassword );
module.exports = router;