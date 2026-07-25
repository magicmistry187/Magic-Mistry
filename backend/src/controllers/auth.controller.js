const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const otpModel = require('../models/otp.model');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const userVerification = require('../templates/userVerifcationTemplate');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// In-memory dev fallback when MongoDB service is offline
const inMemoryUsers = [];
const inMemoryOtps = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

// send otp
async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    if (isDbConnected()) {
      const checkUser = await userModel.findOne({ email });
      if (checkUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      let result = await otpModel.findOne({ otp });
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        result = await otpModel.findOne({ otp });
      }

      await otpModel.create({ email, otp });
    } else {
      console.log(`[DEV FALLBACK - DB Offline] Generating OTP for ${email}: ${otp}`);
      const existingUser = inMemoryUsers.find((u) => u.email === email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
      inMemoryOtps.push({ email, otp, createdAt: new Date() });
    }

    // sending verification email — REQUIRED. If this fails, return an error.
    const emailBody = userVerification(otp);
    await sendEmail(email, 'Magic Mistry OTP Verification', emailBody);

    return res.status(200).json({
      success: true,
      message: 'OTP Sent Successfully to your email',
      email,
    });
  } catch (err) {
    console.log('Error in Otp Send : ', err);

    if (err.message && (err.message.includes('Mail_User') || err.message.includes('Missing credentials') || err.message.includes('Invalid login') || err.message.includes('535'))) {
      return res.status(500).json({
        success: false,
        message: 'Email credentials are invalid. Check Mail_User and Mail_Pass in .env',
      });
    }

    return res.status(500).json({
      success: false,
      error: err.message,
      message: 'Something went wrong while sending OTP. Please try again.',
    });
  }
}

// signup
async function signup(req, res) {
  try {
    const { fullName, email, password, phoneNumber, otp } = req.body;

    if (!fullName || !email || !password || !phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (isDbConnected()) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const recentOtp = await otpModel
        .findOne({ email })
        .sort({ createdAt: -1 })
        .limit(1);

      if (!recentOtp) {
        return res.status(400).json({ success: false, message: 'OTP not Found' });
      }
      if (otp !== recentOtp.otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await userModel.create({
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
      });

      return res.status(200).json({
        success: true,
        message: 'User is Signed Up',
        user,
      });
    } else {
      console.log(`[DEV FALLBACK - DB Offline] Processing signup for ${email}`);
      const existingUser = inMemoryUsers.find((u) => u.email === email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const userOtps = inMemoryOtps.filter((o) => o.email === email);
      const recentOtp = userOtps[userOtps.length - 1];

      if (!recentOtp) {
        return res.status(400).json({ success: false, message: 'OTP not Found' });
      }
      if (otp !== recentOtp.otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        _id: 'mem_' + Date.now(),
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        createdAt: new Date(),
      };
      inMemoryUsers.push(user);

      const userData = { ...user };
      delete userData.password;

      return res.status(200).json({
        success: true,
        message: 'User is Signed Up',
        user: userData,
      });
    }
  } catch (err) {
    console.log('error while signing up', err);
    return res.status(500).json({ success: false, message: 'Error occurred while signing up' });
  }
}

// login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const user = await userModel.findOne({ email: trimmedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const payload = { id: user._id, email: user.email, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      const userData = user.toObject();
      delete userData.password;

      return res
        .cookie('token', token, { httpOnly: true })
        .status(200)
        .json({
          success: true,
          message: 'Login successful.',
          token,
          user: userData,
        });
    } else {
      console.log(`[DEV FALLBACK - DB Offline] Logging in user ${trimmedEmail}`);
      const user = inMemoryUsers.find((u) => u.email.toLowerCase().trim() === trimmedEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const payload = { id: user._id, email: user.email, role: user.role || 'customer' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      const userData = { ...user };
      delete userData.password;

      return res
        .cookie('token', token, { httpOnly: true })
        .status(200)
        .json({
          success: true,
          message: 'Login successful.',
          token,
          user: userData,
        });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  signup,
  sendOtp,
  login,
};
