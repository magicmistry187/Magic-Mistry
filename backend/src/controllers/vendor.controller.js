const User = require('../models/user.model');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const {
  checkVendorExistsByEmail,
  checkVendorExistsByEmailOrPhone,
  createOrUpdateVendorAccount,
} = require('../utils/vendor.utils');

// VENDOR login
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
      $or: [
        { vendorId: loginValue.toUpperCase() },
        { vendorId: loginValue },
        { email: loginValue.toLowerCase() },
      ],
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
        message: 'Your vendor account has been blocked by the administrator.',
      });
    }

    if (vendor.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account has been suspended by the administrator.',
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
        id: vendor._id,
        userId: vendor._id,
        email: vendor.email,
        role: vendor.role,
        vendorId: vendor.vendorId,
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '7d',
      },
    );

    res.cookie('vendorToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const vendorData = {
      id: vendor._id,
      _id: vendor._id,
      vendorId: vendor.vendorId,
      fullName: vendor.fullName,
      email: vendor.email,
      role: vendor.role,
    };

    return res.status(200).json({
      success: true,
      message: 'Vendor login successful',
      token,
      vendor: {
        ...vendorData,
        token: token,
      },
      user: vendorData,
    });
  } catch (error) {
    console.error('Vendor login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during vendor login',
    });
  }
};

// Create vendor by Admin (Checks if vendor with same email already exists)
exports.createVendorByAdmin = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, specialization, serviceArea, experience } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email are required.',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const cleanPhone = phoneNumber ? phoneNumber.trim() : '';

    // Check if vendor already exists for this email OR phone number
    const existingVendor = await checkVendorExistsByEmailOrPhone(trimmedEmail, cleanPhone);
    if (existingVendor) {
      const matchField =
        existingVendor.email === trimmedEmail ? 'email address' : 'mobile number';
      const matchedVal =
        existingVendor.email === trimmedEmail ? trimmedEmail : cleanPhone;
      return res.status(409).json({
        success: false,
        message: `A vendor account is already registered with this ${matchField} "${matchedVal}" (Vendor ID: ${existingVendor.vendorId || 'Assigned'}). A new ID cannot be generated.`,
        vendorId: existingVendor.vendorId,
      });
    }

    const { user, vendorId, temporaryPassword } = await createOrUpdateVendorAccount({
      fullName,
      email: trimmedEmail,
      phoneNumber,
      specialization,
      serviceType: specialization,
      experience,
      experienceDescription: 'Vendor created by Admin',
      serviceAddress: serviceArea,
    });

    return res.status(200).json({
      success: true,
      message: 'Vendor credentials generated successfully.',
      vendor: {
        id: user._id,
        vendorId: user.vendorId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      credentials: {
        vendorId,
        temporaryPassword,
      },
    });
  } catch (error) {
    console.error('Create vendor by admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create vendor credentials. Error: ' + (error.message || error),
    });
  }
};
