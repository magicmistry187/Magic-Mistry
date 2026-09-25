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
} = require('../controllers/address.controller');

const {checkBlockedUser} = require('../middleware/checkBlockUser');

// Public reverse-geocode endpoint (for all users, guests, and technicians)
router.get('/reverse-geocode', reverseGeocode);

// All address endpoints are protected with standard auth middleware
router.post('/', auth,checkBlockedUser, createAddress);
router.get('/', auth, getAddresses);
router.get('/:id', auth, getAddress);
router.put('/:id', auth, checkBlockedUser, updateAddress);
// router.put('/', auth, updateAddress);
router.delete('/:id', auth,  deleteAddress);
// router.delete('/', auth, deleteAddress);

module.exports = router;

