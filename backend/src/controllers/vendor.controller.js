const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const VendorProfile = require('../models/vendorProfile.model');

// VENDOR login
exports.vendorLogin = async (req, res) => {
  try {
    const { login, password } = req.body;

    // 1. Validate input
    if (!login?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID/email and password are required',
      });
    }

    const loginValue = login.trim();

    // 2. Find vendor by Vendor ID or Email
    const vendor = await User.findOne({
      role: 'vendor',
      $or: [
        { vendorId: loginValue.toUpperCase() },
        { email: loginValue.toLowerCase() },
      ],
    }).select('+password');

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Vendor ID/email or password',
      });
    }

    // 3. Check account status
    if (vendor.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account has been blocked by the administrator.',
      });
    }

    if (vendor.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account has been suspended by the administrator.',
      });
    }

    // 4. Check approval
    if (!vendor.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account is not approved.',
      });
    }

    // 5. Check password
    if (!vendor.password) {
      return res.status(401).json({
        success: false,
        message: 'Vendor password is not configured.',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      vendor.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Vendor ID/email or password',
      });
    }

    // 6. Generate JWT
    const token = jwt.sign(
      {
        id: vendor._id,
        email: vendor.email,
        role: vendor.role,
        vendorId: vendor.vendorId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    // 7. Store token in cookie
    res.cookie('vendorToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 8. Return vendor data
    return res.status(200).json({
      success: true,
      message: 'Vendor login successful',
      vendor: {
        _id: vendor._id,
        vendorId: vendor.vendorId,
        fullName: vendor.fullName,
        email: vendor.email,
        role: vendor.role,
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



//--------------------Vendor Profile-------------

exports.getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    const vendorProfile = await VendorProfile.findOne({ vendorId })
      .populate('serviceAddress')
      .populate('user');

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }
    return res.status(200).json({
      success: true,
      vendorProfile,
      message: 'Vendor profile fetched successfully.',
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor profile.',
    });
  }
};


exports.updateVendorProfile = async (req, res)=>{
   
   const userId = req.user._id;

    
    const vendorProfile = await VendorProfile.findOne({
      user: userId,
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }
}