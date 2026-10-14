const express = require('express');
const router = express.Router();
const { createPayoutRequest } = require('../controllers/payout.controller');
const { auth, isVendor } = require('../middleware/auth');

router.post('/request', auth, isVendor, createPayoutRequest);



module.exports = router;
