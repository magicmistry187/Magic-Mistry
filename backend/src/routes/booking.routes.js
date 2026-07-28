const express = require('express');
const router = express.Router();

const {auth, isCustomer} = require('../middleware/auth')
const upload = require ('../middleware/multer')

const{createBooking,getMyBookings,getBookingDetails,cancelBooking} = require('../controllers/booking.controller')

router.post("/", auth, isCustomer,upload.single("image"), createBooking);

router.get("/my-bookings", auth, isCustomer, getMyBookings);

router.get("/:bookingId", auth, isCustomer, getBookingDetails);

router.put("/:bookingId/cancel", auth, isCustomer, cancelBooking);

module.exports = router;

// address model banana h