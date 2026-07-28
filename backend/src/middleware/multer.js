const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;


const Booking = require('../models/booking.model');
const { uploadImageToImageKit } = require('../config/imagekit');


