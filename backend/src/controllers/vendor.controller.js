const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const VendorProfile = require('../models/vendorProfile.model');
const uploadImageToImageKit = require('../config/imagekit');

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

    const isPasswordCorrect = await bcrypt.compare(password, vendor.password);

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
      },
    );

    // 7. Store token in cookie
    res.cookie('vendorToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 8. Return vendor data (include token in body so the frontend can
    //    save it to localStorage and restore the session after browser close)
    return res.status(200).json({
      success: true,
      message: 'Vendor login successful',
      token,
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
    console.log("get profile is called");

    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const vendorProfile = await VendorProfile.findOne({
      user: user._id,
    }).populate("user", "-password");

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      vendorProfile,
      message: "Vendor profile fetched successfully.",
    });

  } catch (error) {
    console.error("Get vendor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor profile.",
      error: error.message,
    });
  }
};

exports.updateVendorProfile = async (req, res) => {
  try {
    // console.log('Update Vendor Profile Request Body:', req.body);
    const userId = req.user.id
    // console.log('[Vendor Controller] 📝 updateVendorProfile called for user ID:', userId, 'req.user:', req.user);
    // console.log('  Body keys:', Object.keys(req.body));
    
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user && req.user?.email) {
      user = await User.findOne({ email: req.user.email.toLowerCase().trim() });
    }
    if (!user && req.user?.vendorId) {
      user = await User.findOne({ vendorId: req.user.vendorId });
    }

    if (!user) {
      console.warn('[Vendor Controller] ⚠️ User account not found for ID:', userId, 'email:', req.user?.email);
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const vendorId = req.user.vendorId || user?.vendorId;

    let vendorProfile = await VendorProfile.findOne({
      $or: [
        { user: user._id },
        ...(vendorId ? [{ vendorId }] : []),
      ],
    });

    if (!vendorProfile) {
      const fallbackVendorId = vendorId || `FX-V-${Math.floor(1000 + Math.random() * 9000)}`;
      vendorProfile = await VendorProfile.create({
        user: user._id,
        vendorId: fallbackVendorId,
        professionalTitle: 'Service Technician',
        serviceType: 'General',
        experience: 0,
        appliancesServed: [],
      });

      if (!user.vendorId) {
        user.vendorId = fallbackVendorId;
        await user.save();
      }
    } else {
      if (!vendorProfile.user) vendorProfile.user = user._id;
      if (!vendorProfile.vendorId && vendorId) vendorProfile.vendorId = vendorId;
    }

    const userFields = ['fullName', 'phoneNumber', 'location'];

    const vendorFields = [
      'serviceType',
      'experience',
      'experienceDescription',
      'professionalTitle',
      'vendorUpiId',
      'serviceRadius',
      'serviceAddress',
    ];

    const userUpdate = {};
    const vendorUpdate = {};

    userFields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field] !== ''
      ) {
        userUpdate[field] = req.body[field];
      }
    });

    vendorFields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field] !== ''
      ) {
        if (field === 'experience' || field === 'serviceRadius') {
          const num = Number(req.body[field]);
          if (!isNaN(num)) vendorUpdate[field] = num;
        } else {
          vendorUpdate[field] = req.body[field];
        }
      }
    });

    // Also sync user location if serviceAddress was provided and location was not explicitly provided
    if (req.body?.serviceAddress && !userUpdate.location) {
      userUpdate.location = req.body.serviceAddress;
    }

    if (req.body?.bankDetails) {
      try {
        const bankDetails =
          typeof req.body.bankDetails === 'string'
            ? JSON.parse(req.body.bankDetails)
            : req.body.bankDetails;

        vendorUpdate.bankDetails = {
          ...(vendorProfile.bankDetails?.toObject?.() ||
            vendorProfile.bankDetails ||
            {}),
          ...bankDetails,
        };
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bankDetails format.',
        });
      }
    }

    if (req.body?.appliancesServed !== undefined) {
      try {
        const appliances =
          typeof req.body.appliancesServed === 'string'
            ? JSON.parse(req.body.appliancesServed)
            : req.body.appliancesServed;

        if (Array.isArray(appliances)) {
          vendorUpdate.appliancesServed = appliances;
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid appliancesServed format.',
        });
      }
    }

    if (req.file) {
      try {
        const result = await uploadImageToImageKit(
          req.file.buffer,
          req.file.originalname || `vendor-profile-${Date.now()}.jpg`,
        );

        if (result?.url) {
          vendorUpdate.profileImage = {
            url: result.url,
            fileId: result.fileId || null,
          };
        }
      } catch (error) {
        console.error('Profile image upload failed:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile image.',
          error: error.message,
        });
      }
    }

    let updatedUser = null;
    if (Object.keys(userUpdate).length > 0) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: userUpdate },
        {
          new: true,
          runValidators: true,
        },
      ).select('-password');
    } else {
      updatedUser = await User.findById(userId).select('-password');
    }

    let updatedVendorProfile = vendorProfile;
    if (Object.keys(vendorUpdate).length > 0) {
      Object.assign(vendorProfile, vendorUpdate);
      await vendorProfile.save();
    }

    updatedVendorProfile = await VendorProfile.findById(vendorProfile._id)
      .populate('user', '-password');

    return res.status(200).json({
      success: true,
      message: 'Vendor profile updated successfully.',
      data: {
        user: updatedUser,
        vendorProfile: updatedVendorProfile,
      },
    });
  } catch (error) {
    console.error('Update Vendor Profile Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update vendor profile.',
      error: error.message,
    });
  }
};




exports.updateVendorProfileImage = async (req, res) => {
  try {
    console.log('Update Vendor Profile Image Request:', req.file);
    const userId = req.user.id || req.user.userId || req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile image is required.',
      });
    }

    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user && req.user?.email) {
      user = await User.findOne({ email: req.user.email.toLowerCase().trim() });
    }
    if (!user && req.user?.vendorId) {
      user = await User.findOne({ vendorId: req.user.vendorId });
    }

    const vendorId = req.user?.vendorId || user?.vendorId;
    const targetUserId = user?._id || userId;

    let vendorProfile = await VendorProfile.findOne({
      $or: [
        { user: targetUserId },
        ...(vendorId ? [{ vendorId }] : []),
      ],
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    const uploadedImage = await uploadImageToImageKit(
      req.file.buffer,
      req.file.originalname,
    );

    vendorProfile.profileImage = {
      url: uploadedImage.url,
      fileId: uploadedImage.fileId,
    };

    await vendorProfile.save();

    return res.status(200).json({
      success: true,
      message: 'Vendor profile image updated successfully.',
      profileImage: vendorProfile.profileImage,
    });
  } catch (error) {
    console.error('Update vendor profile image error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update vendor profile image.',
    });
  }
};
