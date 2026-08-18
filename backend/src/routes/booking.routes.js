const express = require('express');
const router = express.Router();

const { auth, isCustomer,isVendor,isAdmin } = require('../middleware/auth');
const upload = require('../middleware/multer');

const {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
  getBookingsToAdmin,
  getBookingsToVendor
} = require('../controllers/booking.controller');

router.post('/', auth, isCustomer, upload.single('image'), createBooking);

router.get('/my-bookings', auth, isCustomer, getMyBookings);

router.get('/admin/bookings', auth, isAdmin, getBookingsToAdmin);

router.get('/vendor/bookings', auth, isVendor, getBookingsToVendor);

router.patch('/:bookingId/cancel', auth, isCustomer, cancelBooking);

router.get('/:bookingId', auth, getBookingDetails);

module.exports = router;

// address model banana h
