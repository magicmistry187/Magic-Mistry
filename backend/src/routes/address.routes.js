const express = require('express');
const router = express.Router();


const { auth, isCustomer, isCustomerOrVendor } = require('../middleware/auth');
const {
  createAddress,
  getAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require('../controllers/address.controller');

// POST /api/address — both customers and vendors can save a location address
// Vendors use this to save their service location into the User Location Save module
router.post('/', auth, isCustomerOrVendor, createAddress);

router.get('/', auth, isCustomer, getAddresses);

router.get('/:id', auth, isCustomer, getAddress);

router.put('/:id', auth, isCustomer, updateAddress);

router.delete('/:id', auth, isCustomer, deleteAddress);

module.exports = router;

