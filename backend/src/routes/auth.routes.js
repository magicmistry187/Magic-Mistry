const express = require('express');
const router = express.Router();



// const { auth, isCustomer, isVendor, isAdmin, authorizeRoles } = require("../middleware/auth");
const { signup,sendOtp,login,googleLogin, changePassword } = require('../controllers/auth.controller');


/////////// api routes
router.post('/signup', signup);
router.post('/sendOtp',sendOtp)
router.post('/login',login)
router.post('/googleLogin',googleLogin)
router.post('/changePassword', changePassword);

module.exports = router;