const express = require('express');
const router = express.Router();

const { createFuelClaim } = require('../controllers/fuelClaim.controller');


const { auth, isVendor } = require('../middleware/auth');
const upload = require('../middleware/multer');


router.post(
  '/',
  auth, isVendor,
  upload.fields([
    { name: 'petrolReceipt', maxCount: 1 },
    { name: 'mapProof', maxCount: 1 },
    { name: 'odometer', maxCount: 1 },
  ]),
  createFuelClaim,
);

module.exports = router;
