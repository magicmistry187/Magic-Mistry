const express = require('express');
const router = express.Router();

const { auth, isCustomer, isVendor, isAdmin } = require('../middleware/auth');
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
  routeVerification,
  submitServiceDetails,
} = require('../controllers/booking.controller');

router.post('/', auth, isCustomer, upload.single('image'), createBooking);

router.get('/my-bookings', auth, isCustomer, getMyBookings);

router.get('/admin/bookings', auth, isAdmin, getBookingsToAdmin);

// router.get('/vendor/bookings', auth, isVendor, getBookingsToVendor);

router.get('/vendor/bookings', auth, isVendor, getBookingToVendorUnderRange);

router.patch('/:bookingId/accept', auth, isVendor, acceptBooking);

router.patch('/:bookingId/status', auth, isVendor, updateBookingStatus);

router.patch('/:bookingId/cancel', auth, isCustomer, cancelBooking);

router.get('/:bookingId', auth, getBookingDetails);

router.post(
  '/:bookingId/route-verification',
  auth,
  isVendor,
  upload.single('image'),
  routeVerification,
);

router.patch(
  '/:bookingId/service-details',
  auth,
  isVendor,
  upload.fields([
    {
      name: 'beforeImage',
      maxCount: 1,
    },
    {
      name: 'afterImage',
      maxCount: 1,
    },
  ]),
  submitServiceDetails,
);

module.exports = router;
