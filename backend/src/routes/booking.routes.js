const express = require('express');
const router = express.Router();

const {auth, isCustomer} = require('../middleware/auth')

const{createBooking,getMyBookings,getBookingDetails,cancelBooking} = require('../controllers/booking.controller')

router.post("/", auth, iscustomer, createBooking);

router.get("/my-bookings", auth, iscustomer, getMyBookings);

router.get("/:bookingId", auth, iscustomer, getBookingDetails);

router.put("/:bookingId/cancel", auth, iscustomer, cancelBooking);

module.exports = router;