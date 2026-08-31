const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const VendorProfile = require('../models/vendorProfile.model');
const Address = require('../models/address.model');
const {
  uploadImageToImageKit,
  deleteImageFromImageKit,
} = require('../config/imagekit');

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
    // console.log("get profile is called");

    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const vendorProfile = await VendorProfile.findOne({
      user: user._id,
    }).populate('user', '-password');

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    // Strictly sync with Address collection (same as User Address model)
    const addressCount = await Address.countDocuments({ user: user._id });
    if (addressCount === 0) {
      if (vendorProfile.serviceAddress || user.location) {
        vendorProfile.serviceAddress = '';
        await vendorProfile.save();
        user.location = '';
        await user.save();
        if (vendorProfile.user) {
          vendorProfile.user.location = '';
        }
      }
    } else {
      const defaultAddr = await Address.findOne({ user: user._id }).sort({ isDefault: -1, createdAt: -1 });
      if (defaultAddr) {
        const formatted = [
          defaultAddr.house || defaultAddr.addressLine1,
          defaultAddr.street,
          defaultAddr.landmark,
          defaultAddr.city,
          defaultAddr.state,
          defaultAddr.pincode,
        ]
          .filter(Boolean)
          .join(', ');
        vendorProfile.serviceAddress = formatted;
        await vendorProfile.save();
      }
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
      error: error.message,
    });
  }
};

exports.updateVendorProfile = async (req, res) => {
  try {
    console.log('update vendor called');
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const vendorProfile = await VendorProfile.findOne({
      user: user._id,
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
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

    userFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        user[field] = req.body[field];
      }
    });

    vendorFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        if (field === 'experience' || field === 'serviceRadius') {
          const value = Number(req.body[field]);

          if (Number.isNaN(value)) {
            return;
          }

          vendorProfile[field] = value;
        } else {
          vendorProfile[field] = req.body[field];
        }
      }
    });

    if (req.body.bankDetails !== undefined) {
      let bankDetails;

      try {
        bankDetails =
          typeof req.body.bankDetails === 'string'
            ? JSON.parse(req.body.bankDetails)
            : req.body.bankDetails;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bankDetails format.',
        });
      }

      if (
        typeof bankDetails !== 'object' ||
        Array.isArray(bankDetails) ||
        bankDetails === null
      ) {
        return res.status(400).json({
          success: false,
          message: 'bankDetails must be an object.',
        });
      }

      vendorProfile.bankDetails = {
        ...(vendorProfile.bankDetails?.toObject?.() ||
          vendorProfile.bankDetails ||
          {}),
        ...bankDetails,
      };
    }

    if (req.body.appliancesServed !== undefined) {
      let appliances;

      try {
        appliances =
          typeof req.body.appliancesServed === 'string'
            ? JSON.parse(req.body.appliancesServed)
            : req.body.appliancesServed;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid appliancesServed format.',
        });
      }

      if (!Array.isArray(appliances)) {
        return res.status(400).json({
          success: false,
          message: 'appliancesServed must be an array.',
        });
      }

      vendorProfile.appliancesServed = appliances;
    }

    await Promise.all([user.save(), vendorProfile.save()]);

    await vendorProfile.populate('user', '-password');

    return res.status(200).json({
      success: true,
      message: 'Vendor profile updated successfully.',
      data: {
        user: vendorProfile.user,
        vendorProfile,
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
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided.',
      });
    }

    const vendorProfile = await VendorProfile.findOne({
      user: userId,
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    const oldFileId = vendorProfile.profileImage?.fileId;

    const uploadResult = await uploadImageToImageKit(
      req.file.buffer,
      req.file.originalname,
    );

    if (!uploadResult?.url) {
      return res.status(500).json({
        success: false,
        message: 'Image upload failed.',
      });
    }

    vendorProfile.profileImage = {
      url: uploadResult.url,
      fileId: uploadResult.fileId || null,
    };

    await vendorProfile.save();

    if (oldFileId) {
      try {
        await deleteImageFromImageKit(oldFileId);
      } catch (error) {
        console.error('Old image deletion failed:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile image updated successfully.',
      profileImage: vendorProfile.profileImage,
    });
  } catch (error) {
    console.error('Update profile image error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update profile image.',
      error: error.message,
    });
  }
};
