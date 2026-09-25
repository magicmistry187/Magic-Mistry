const express = require('express');
const router = express.Router();

const { auth, isCustomer,isVendor,isAdmin } = require('../middleware/auth');
const {checkBlockedUser} = require('../middleware/checkBlockUser');
const upload = require('../middleware/multer');

const {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
  getBookingsToAdmin,
  getBookingsToVendor,
  getBookingToVendorUnderRange,
  acceptBooking,
  updateBookingStatus,
} = require('../controllers/booking.controller');

router.post('/', auth, isCustomer,checkBlockedUser, upload.single('image'), createBooking);

router.get('/my-bookings', auth, isCustomer, getMyBookings);

router.get('/admin/bookings', auth, isAdmin, getBookingsToAdmin);

// router.get('/vendor/bookings', auth, isVendor, getBookingsToVendor);

router.get('/vendor/bookings' , auth , isVendor ,checkBlockedUser, getBookingToVendorUnderRange);

router.patch('/:bookingId/accept', auth, isVendor, checkBlockedUser, acceptBooking);

router.patch('/:bookingId/status', auth, isVendor,checkBlockedUser, updateBookingStatus);

router.patch('/:bookingId/cancel', auth, isCustomer, checkBlockedUser, cancelBooking);

router.get('/:bookingId', auth, getBookingDetails);

module.exports = router;

// address model banana h
