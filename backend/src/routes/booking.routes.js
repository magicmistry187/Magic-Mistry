const express = require('express');
const router = express.Router();

const { auth, isCustomer,isVendor,isAdmin } = require('../middleware/auth');
const {checkUserRestricted} = require('../middleware/checkUserRestricted');
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
  completeService,
} = require('../controllers/booking.controller');

router.post('/', auth, isCustomer,checkUserRestricted, upload.single('image'), createBooking);

router.get('/my-bookings', auth, isCustomer,checkUserRestricted, getMyBookings);

router.get('/admin/bookings', auth, isAdmin,checkUserRestricted ,getBookingsToAdmin);

// router.get('/vendor/bookings', auth, isVendor, getBookingsToVendor);

router.get('/vendor/bookings' , auth , isVendor ,checkUserRestricted, getBookingToVendorUnderRange);

router.patch('/:bookingId/accept', auth, isVendor, checkUserRestricted, acceptBooking);

router.patch('/:bookingId/status', auth, isVendor,checkUserRestricted, updateBookingStatus);

router.patch('/:bookingId/cancel', auth, isCustomer, checkUserRestricted, cancelBooking);

router.get('/:bookingId', auth, checkUserRestricted, getBookingDetails);

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

router.post(
  '/:bookingId/complete',
  auth,
  isVendor,
  completeService
);

module.exports = router;
