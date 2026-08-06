const express = require('express');
const router = express.Router();


const { auth, isCustomer } = require('../middleware/auth');
const {
  createAddress,
  getAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require('../controllers/address.controller');

router.post('/', auth, isCustomer, createAddress);

router.get('/', auth, isCustomer, getAddresses);

router.get('/:id', auth, isCustomer, getAddress);

router.put('/:id', auth, isCustomer, updateAddress);

router.delete('/:id', auth, isCustomer, deleteAddress);

module.exports = router;
