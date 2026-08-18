const User = require('../models/user.model');
const VendorProfile = require('../models/vendorProfile.model');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

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

// Create or update vendor by Admin
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
    let user = await User.findOne({ email: trimmedEmail });

    const vendorId = user?.vendorId || `FX-V-${Math.floor(1000 + Math.random() * 9000)}`;
    const temporaryPassword = `FixIt_${new Date().getFullYear()}_!${crypto
      .randomBytes(2)
      .toString('hex')}`;
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    if (user) {
      user.fullName = fullName.trim();
      if (phoneNumber) user.phoneNumber = phoneNumber.trim();
      user.role = 'vendor';
      user.isApproved = true;
      user.status = 'active';
      user.vendorId = vendorId;
      user.password = hashedPassword;
      if (!user.authProviders.includes('email')) {
        user.authProviders.push('email');
      }
      await user.save();
    } else {
      user = await User.create({
        fullName: fullName.trim(),
        email: trimmedEmail,
        phoneNumber: phoneNumber ? phoneNumber.trim() : '',
        password: hashedPassword,
        role: 'vendor',
        authProviders: ['email'],
        status: 'active',
        isApproved: true,
        vendorId,
      });
    }

    let vendorProfile = await VendorProfile.findOne({ user: user._id });
    if (!vendorProfile) {
      vendorProfile = await VendorProfile.create({
        user: user._id,
        professionalTitle: specialization || 'Service Technician',
        serviceType: specialization || 'General',
        experience: Number(experience) || 0,
        experienceDescription: 'Vendor created by Admin',
        serviceAddress: serviceArea || '',
      });
    } else {
      if (specialization) vendorProfile.professionalTitle = specialization;
      if (serviceArea) vendorProfile.serviceAddress = serviceArea;
      await vendorProfile.save();
    }

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
        vendorId: user.vendorId,
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
