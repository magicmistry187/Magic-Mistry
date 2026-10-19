const express = require('express');
const router = express.Router();

const { auth, isAdmin } = require('../middleware/auth');

const {
  updateUserStatus,
  getAllUsers,
  getAllPaymentRequests,
  updatePayoutStatus,
  updateFuelClaimStatus,
} = require('../controllers/admin.controller');

router.patch('/:userId/status', auth, isAdmin, updateUserStatus);

router.get('/users', auth, isAdmin, getAllUsers);
// http://localhost:5000/api/admin/users?page=3&limit=10

router.get('/payment-requests', auth, isAdmin, getAllPaymentRequests);
//http://localhost:5000/api/admin/payment-requests?page=1&limit=10

router.patch('/payout/:payoutId/status', auth, isAdmin, updatePayoutStatus);

router.patch('/fuelclaim/:claimId/status', auth, isAdmin, updateFuelClaimStatus);

module.exports = router;
