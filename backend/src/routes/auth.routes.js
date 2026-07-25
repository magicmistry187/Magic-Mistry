const express = require('express');
const router = express.Router();



// const { auth, isCustomer, isVendor, isAdmin, authorizeRoles } = require("../middleware/auth");
const { signup,sendOtp,login } = require('../controllers/auth.controller');


/////////// api routes
router.post('/signup', signup);
router.post('/sendOtp',sendOtp)
router.post('/login',login)

module.exports = router;