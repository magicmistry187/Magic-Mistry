const express = require("express");
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

const { loginLimiter, otpLimiter } = require("../middleware/rateLimiter");

const {
  updateUserLocation,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/user.controller");

const { checkBlockedUser } = require("../middleware/checkBlockUser");

/////////// api routes
router.post("/signup", signup);
router.post("/sendOtp", otpLimiter, sendOtp);
router.post("/login", loginLimiter, login);
router.post("/googleLogin", googleLogin);
router.post("/logout", logout);
router.get("/logout", logout);
router.post("/changePassword", auth,checkBlockedUser, changePassword);
router.post("/forgotPassword/verifyOtp", verifyOtpForForgotPassword);
router.post("/forgotPassword", forgotPassword);

// -------------User controller routes-----------------
router.put("/update-location", auth,checkBlockedUser, updateUserLocation);
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, checkBlockedUser, updateUserProfile);

module.exports = router;
