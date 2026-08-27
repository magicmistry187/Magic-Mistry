const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const otpModel = require('../models/otp.model');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const userVerification = require('../templates/userVerifcationTemplate');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const axios = require('axios');

function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    vendorId: user.vendorId || undefined,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
}

// send otp
//little bit modifying it for forgot password and signup
async function sendOtp(req, res) {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const checkUser = await userModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (purpose === 'signup' && checkUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    if (purpose === 'forgotPassword' && !checkUser) {
      return res.status(400).json({
        success: false,
        message: 'User is not registered with this email',
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await otpModel.findOne({ otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await otpModel.findOne({ otp });
    }

    await otpModel.create({
      email: email.toLowerCase().trim(),
      otp,
      purpose,
    });

    const emailBody = userVerification(otp);
    await sendEmail(
      email.toLowerCase().trim(),
      'Verification Code - Magic Mistry',
      emailBody,
    );

    return res.status(200).json({
      success: true,
      message: 'OTP Sent Successfully to your email',
      email,
    });
  } catch (err) {
    console.log('Error in OTP Send:', err);

    if (
      err.message &&
      (err.message.includes('Mail_User') ||
        err.message.includes('Missing credentials') ||
        err.message.includes('Invalid login') ||
        err.message.includes('535'))
    ) {
      return res.status(500).json({
        success: false,
        message:
          'Email credentials are invalid. Check Mail_User and Mail_Pass in .env',
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
    const { fullName, email, password, phoneNumber, otp, role } = req.body;

    if (!fullName || !email || !password || !phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const existingUser = await userModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const recentOtp = await otpModel
      .findOne({ email: email.toLowerCase().trim(), purpose: 'signup' })
      .sort({ createdAt: -1 });

    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: 'OTP not Found',
      });
    }

    if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phoneNumber,
      authProviders: ['email'],
      // role: "admin", // Default role is 'user' if not provided
    });

    const token = generateToken(user);

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: 'User is Signed Up',
      token,
      user: userData,
    });
  } catch (err) {
    console.log('Error while signing up:', err);

    return res.status(500).json({
      success: false,
      message: 'Error occurred while signing up',
    });
  }
}

// login
async function login(req, res) {
  try {
    // console.log("Login controller");
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Find user
    const user = await userModel
      .findOne({ email: trimmedEmail })
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Vendors must use vendor login
    if (user.role === 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Vendors must use the vendor login.',
      });
    }

    // User signed up only with Google
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          'This account was created using Google. Please sign in with Google.',
      });
    }

    // Check account status
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message:
          'Your account has been blocked. Please contact the administrator.',
      });
    }

    // // Vendor approval check
    // if (user.role === "vendor" && !user.isApproved) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Your account is waiting for admin approval.",
    //   });
    // }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked by the administrator.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the administrator.',
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);
    // console.log("Token generated:", token);

    // Remove password before sending response
    const userData = user.toObject();
    delete userData.password;

    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .status(200)
      .json({
        success: true,
        message: 'Login successful.',
        token,
        user: userData,
      });
  } catch (error) {
    console.error('Login Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}

// google auth
async function googleLogin(req, res) {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required.',
      });
    }

    const { data: googleUser } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const { sub: googleId, email, name, email_verified } = googleUser;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google email is not verified.',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    let user = await userModel.findOne({ googleId });

    if (!user) {
      user = await userModel.findOne({
        email: trimmedEmail,
      });

      if (user) {
        user.googleId = googleId;
        user.isEmailVerified = true;

        if (!user.authProviders.includes('google')) {
          user.authProviders.push('google');
        }

        await user.save();
      } else {
        user = await userModel.create({
          fullName: name,
          email: trimmedEmail,
          googleId,
          authProviders: ['google'],
          isEmailVerified: true,
        });
      }
    }

    if (user.role === 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Vendors cannot use Google login. Please use vendor login.',
      });
    }

    const token = generateToken(user);
    // console.log("Google login successful. Token generated:", token);
    // console.log("User details:", user);

    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .status(200)
      .json({
        success: true,
        message: 'Google login successful.',
        token,
        user,
      });
  } catch (error) {
    console.error('Google Login Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}

//extra api ... for future use ... for changing password
async function changePassword(req, res) {
  try {
    //get user id from auth middleware or token
    const userId = req.user.id;

    //get user info from db

    const userDetails = await userModel.findById(userId).select('+password');

    //get old and new password from request body
    const { oldPassword, newPassword } = req.body;

    //validaton for both fields if any of them is missing

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    //Check if old password is correct or not

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password,
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message:
          'Password does not match, please enter your correct current password',
      });
    }

    //hash the new password and update it in the database

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateUserDetails = await userModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
      },
      {
        new: true,
      },
    );

    try {
      //send email to user about password change

      await sendEmail(
        updateUserDetails.email,
        'Password Changed Successfully',
        `Password Changed Successfully for ${updateUserDetails.fullName}`,
      );
    } catch (err) {
      console.error('Email notification failed on password change:', err);
    }

    return res.status(200).json({
      success: true,
      message: 'Password Changed Successfully',
    });
  } catch (err) {
    console.log('Error while changing password: ', err);

    return res.status(500).json({
      success: false,
      error: err.message,
      message: 'Something went wrong while changing password',
    });
  }
}

//verify otp for forgot password
async function verifyOtpForForgotPassword(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await userModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User is not registered with this email',
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required',
      });
    }

    const recentOtp = await otpModel
      .findOne({
        email: email.toLowerCase().trim(),
        purpose: 'forgotPassword',
      })
      .sort({ createdAt: -1 });

    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    const resetToken = jwt.sign(
      {
        userId: user._id,
        purpose: 'resetPassword',
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '10m',
      },
    );

    await otpModel.deleteOne({
      _id: recentOtp._id,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP verified Successfully',
      resetToken,
    });
  } catch (err) {
    console.error('Error while verifying  OTP: ', err);

    return res.status(500).json({
      success: false,
      error: err.message,
      message: 'Something went wrong while verifying OTP',
    });
  }
}

// Api for forgot password
async function forgotPassword(req, res) {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Password reset session is missing. Please request a new OTP.',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New Password is required',
      });
    }

    //verify reset token here

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'secret');

    // check if the token is for reset password purpose

    if (decoded.purpose !== 'resetPassword') {
      return res.status(400).json({
        success: false,
        message: 'Invalid password reset session',
      });
    }

    const userId = decoded.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    //Validate the new password strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.',
      });
    }

    // hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update the password in the database

    await userModel.findByIdAndUpdate(userId, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: 'Password Changed Successfully',
    });
  } catch (err) {
    console.error('Error while processing forgot password: ', err);

    //JWT EXPRIED

    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,

        message:
          'Password reset session has expired. Please request a new OTP.',
      });
    }

    // JWT invalid
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid password reset session. Please request a new OTP.',
      });
    }

    return res.status(500).json({
      success: false,
      error: err.message,
      message: 'Something went wrong while processing forgot password',
    });
  }
}

// Update User Active Location
async function updateUserLocation(req, res) {
  try {
    const { location, latitude, longitude } = req.body;
    const userId = req.user.id || req.user.userId || req.user._id;

    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await userModel.findById(userId);
    }
    if (!user && req.user?.email) {
      user = await userModel.findOne({
        email: req.user.email.toLowerCase().trim(),
      });
    }
    if (!user && req.user?.vendorId) {
      user = await userModel.findOne({ vendorId: req.user.vendorId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!location && latitude === undefined && longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Location or coordinates required',
      });
    }

    const updateFields = {};
    if (location !== undefined) updateFields.location = String(location).trim();
    if (latitude !== undefined && latitude !== null)
      updateFields.latitude = Number(latitude);
    if (longitude !== undefined && longitude !== null)
      updateFields.longitude = Number(longitude);

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User location updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        location: updatedUser.location,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
      },
    });
  } catch (error) {
    console.error('Update User Location Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location: ' + (error.message || error),
    });
  }
}

// Get Current User Profile
async function getUserProfile(req, res) {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await userModel.findById(userId);
    }
    if (!user && req.user?.email) {
      user = await userModel.findOne({
        email: req.user.email.toLowerCase().trim(),
      });
    }
    if (!user && req.user?.vendorId) {
      user = await userModel.findOne({ vendorId: req.user.vendorId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: user.location || '',
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
}

// Update User Profile
async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await userModel.findById(userId);
    }
    if (!user && req.user?.email) {
      user = await userModel.findOne({
        email: req.user.email.toLowerCase().trim(),
      });
    }
    if (!user && req.user?.vendorId) {
      user = await userModel.findOne({ vendorId: req.user.vendorId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { fullName, phoneNumber, location, latitude, longitude } = req.body;
    const updateFields = {};

    if (fullName) updateFields.fullName = fullName.trim();
    if (phoneNumber) updateFields.phoneNumber = phoneNumber.trim();
    if (location !== undefined) updateFields.location = String(location).trim();
    if (latitude !== undefined && latitude !== null)
      updateFields.latitude = Number(latitude);
    if (longitude !== undefined && longitude !== null)
      updateFields.longitude = Number(longitude);

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        location: updatedUser.location,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
      },
    });
  } catch (error) {
    console.error('Update User Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
}

module.exports = {
  signup,
  sendOtp,
  login,
  googleLogin,
  changePassword,
  verifyOtpForForgotPassword,
  forgotPassword,
  updateUserLocation,
  getUserProfile,
  updateUserProfile,
};
