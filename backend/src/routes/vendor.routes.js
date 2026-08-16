const express = require('express');
const router = express.Router();

const {vendorLogin} = require('../controllers/vendor.controller');




router.post('/login', vendorLogin);

module.exports = router;
