const express = require('express');
const router = express.Router();


const { auth } = require('../middleware/auth');
const {
  createAddress,
  getAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  reverseGeocode,
  autocomplete,
} = require('../controllers/address.controller');

const {checkUserRestricted} = require('../middleware/checkUserRestricted');

// Public reverse-geocode and autocomplete endpoints (for all users, guests, and technicians)
router.get('/reverse-geocode', reverseGeocode);
router.get('/autocomplete', autocomplete);

// All address endpoints are protected with standard auth middleware
router.post('/', auth,checkUserRestricted, createAddress);
router.get('/', auth, getAddresses);
router.get('/:id', auth, getAddress);
router.put('/:id', auth, checkUserRestricted, updateAddress);
// router.put('/', auth, updateAddress);
router.delete('/:id', auth,  deleteAddress);
// router.delete('/', auth, deleteAddress);

module.exports = router;

