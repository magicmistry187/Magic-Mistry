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

exports.updateVendorProfile = async (req, res) => {
  try {
    console.log('Update Vendor Profile Request Body:', req.body);
    const userId = req.user.id;

    const vendorProfile = await VendorProfile.findOne({
      user: userId,
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    const userFields = ['fullName', 'phoneNumber'];

    const vendorFields = [
      'serviceType',
      'experience',
      'experienceDescription',
      'specialization',
      'bio',
      'vendorUpiId',
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
        vendorUpdate[field] = req.body[field];
      }
    });

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

        if (!Array.isArray(appliances)) {
          return res.status(400).json({
            success: false,
            message: 'appliancesServed must be an array.',
          });
        }

        vendorUpdate.appliancesServed = appliances;
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
          'vendor-profiles',
        );

        vendorUpdate.profileImage = result.url;
      } catch (error) {
        console.error('Profile image upload failed:', error);

        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile image.',
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

    const updatedVendorProfile =
      Object.keys(vendorUpdate).length > 0
        ? await VendorProfile.findOneAndUpdate(
            { user: userId },
            { $set: vendorUpdate },
            {
              new: true,
              runValidators: true,
            },
          ).populate('serviceAddress')
        : vendorProfile;

    if (
      Object.keys(userUpdate).length === 0 &&
      Object.keys(vendorUpdate).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'No profile changes were provided.',
      });
    }
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


// delete part is incomplete
exports.updateVendorProfileImage = async (req, res) => {
  try {
    console.log('Update Vendor Profile Image Request:', req.file);
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile image is required.',
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
    console.log('Old File ID:', oldFileId);

    const uploadedImage = await uploadImageToImageKit(
      req.file.buffer,
      req.file.originalname,
    );

    vendorProfile.profileImage = {
      url: uploadedImage.url,
      fileId: uploadedImage.fileId,
    };

    await vendorProfile.save();

    if (oldFileId) {
      try {
        await imagekit.files.delete(oldFileId);
      } catch (deleteError) {
        console.error('Old profile image deletion failed:', deleteError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor profile image updated successfully.',
      profilePhoto: vendorProfile.profilePhoto,
    });
  } catch (error) {
    console.error('Update vendor profile image error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update vendor profile image.',
    });
  }
};
