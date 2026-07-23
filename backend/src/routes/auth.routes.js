const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { signup,sendOtp } = require('../controllers/auth.controller');


/////////// api routes
router.post('/signup', signup);
router.post('/sendOtp',sendOtp)

module.exports = router;