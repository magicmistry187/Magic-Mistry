const User = require('../models/user.model');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');




// VENDOR ka login  banana h aur get Profile
exports.vendorLogin = async (req, res) => {
  try {
    const { login, password } = req.body;
   

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID/email and password are required',
      });
    }
    const loginValue = login.trim();

    const vendor = await User.findOne({
      role: 'vendor',
      $or: [{ vendorId: loginValue }, { email: loginValue.toLowerCase() }],
    }).select('+password');

    

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Vendor ID/email or password',
      });
    }

    if (vendor.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account has been blocked',
      });
    }

    if (!vendor.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account is not approved',
      });
    }

    if (!vendor.password) {
      return res.status(401).json({
        success: false,
        message: 'Vendor password is not configured',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, vendor.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Vendor ID/email or password',
      });
    }

    const token = jwt.sign(
      {
        userId: vendor._id,
        role: vendor.role,
        vendorId: vendor.vendorId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      },
    );

    res.cookie('vendorToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Vendor login successful',
      vendor: {
        id: vendor._id,
        vendorId: vendor.vendorId,
        fullName: vendor.fullName,
        email: vendor.email,
        token: token,
        // role: vendor.role,
      },
    });
  } catch (error) {
    console.error('Vendor login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during vendor login',
    });
  }
};
