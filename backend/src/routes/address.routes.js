const express = require('express');
const router = express.Router();


const { auth } = require('../middleware/auth');
const {
  createAddress,
  getAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require('../controllers/address.controller');

// All address endpoints are protected with standard auth middleware
router.post('/', auth, createAddress);
router.get('/', auth, getAddresses);
router.get('/:id', auth, getAddress);
router.put('/:id', auth, updateAddress);
router.put('/', auth, updateAddress);
router.delete('/:id', auth, deleteAddress);
router.delete('/', auth, deleteAddress);

module.exports = router;

