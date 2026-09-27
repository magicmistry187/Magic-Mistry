const rateLimit = require("express-rate-limit");


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.',
  },
});

const vendorApplicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 applications per hour
  message: {
    success: false,
    message: 'Too many vendor application requests. Please try again later.',
  },
});

module.exports = {
  loginLimiter,
  otpLimiter,
  vendorApplicationLimiter,
};