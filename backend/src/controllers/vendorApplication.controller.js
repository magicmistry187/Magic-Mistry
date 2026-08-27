const mongoose = require('mongoose');
const VendorApplication = require('../models/vendorApplication.model');
const User = require('../models/user.model');
const VendorProfile = require('../models/vendorProfile.model')
const uploadImageToImageKit = require('../config/imagekit');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const {
  checkVendorExistsByEmail,
  checkVendorExistsByEmailOrPhone,
  createOrUpdateVendorAccount,
} = require('../utils/vendor.utils');

const createVendorApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      city,
      specialOption,
      serviceType,
      experience,
      experienceDescription,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !city ||
      !specialOption ||
      !serviceType ||
      experience === undefined ||
      experience === null ||
      experience === '' ||
      !experienceDescription
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided.',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const cleanPhone = phoneNumber.trim();

    // 1. Check if an active vendor already exists with this email OR phone
    const existingVendor = await checkVendorExistsByEmailOrPhone(
      trimmedEmail,
      cleanPhone,
    );
    if (existingVendor) {
      const matchField =
        existingVendor.email === trimmedEmail ? 'email' : 'mobile number';
      const matchedVal =
        existingVendor.email === trimmedEmail ? trimmedEmail : cleanPhone;
      return res.status(409).json({
        success: false,
        message: `A vendor account is already registered with this ${matchField} "${matchedVal}" (Vendor ID: ${existingVendor.vendorId || 'Assigned'}). Please log in directly.`,
      });
    }

    // 2. Check if a pending or approved application already exists with this email or phone
    const existingApplication = await VendorApplication.findOne({
      $or: [{ email: trimmedEmail }, { phoneNumber: cleanPhone }],
      status: { $in: ['Pending', 'Approved'] },
    });

    if (existingApplication) {
      const isEmailMatch = existingApplication.email === trimmedEmail;
      const statusMsg =
        existingApplication.status === 'Pending'
          ? `A pending vendor application already exists for this ${isEmailMatch ? 'email' : 'mobile number'} (Application ID: ${existingApplication.applicationId}).`
          : `A vendor application for this ${isEmailMatch ? 'email' : 'mobile number'} has already been approved.`;
      return res.status(409).json({
        success: false,
        message: statusMsg,
      });
    }

    // checking request files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one document is required.',
      });
    }

    // uploading docs to imagekit
    const documents = [];

    for (const file of req.files) {
      const result = await uploadImageToImageKit(
        file.buffer,
        file.originalname,
      );

      documents.push({
        type: file.originalname,
        url: result.url,
        fileName: result.name,
        fileId: result.fileId,
      });
    }

    // Generate application ID
    const applicationId = `APP-${Date.now()}`;
    // create db entry
    const application = await VendorApplication.create({
      applicationId,

      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      city: city.trim(),
      specialOption: specialOption.trim(),

      serviceType: serviceType.trim(),
      experience: Number(experience),
      experienceDescription: experienceDescription.trim(),

      documents,

      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Vendor application submitted successfully.',
      application,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllVendorApplications = async (req, res) => {
  try {
    const applications = await VendorApplication.find()
      .populate({
        path: 'vendor',
        select: 'vendorId professionalTitle serviceType',
      })
      .sort({ createdAt: -1 });

    // Ensure vendorId is populated for all applications
    const enhancedApplications = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        if (!appObj.vendorId) {
          const user = await User.findOne({
            email: app.email?.toLowerCase().trim(),
          }).select('vendorId');
          appObj.vendorId = user?.vendorId || appObj.vendor?.vendorId || null;
        }
        return appObj;
      }),
    );

    return res.status(200).json({
      success: true,
      applications: enhancedApplications,
    });
  } catch (error) {
    console.error('Get vendor applications error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor applications.',
    });
  }
};

const getVendorApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await VendorApplication.findOne({
      $or: [
        { applicationId: applicationId },
        ...(mongoose.isValidObjectId(applicationId)
          ? [{ _id: applicationId }]
          : []),
      ],
    }).populate('vendor');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Vendor application not found.',
      });
    }

    const appObj = application.toObject();
    if (!appObj.vendorId) {
      const user = await User.findOne({
        email: application.email?.toLowerCase().trim(),
      }).select('vendorId');
      appObj.vendorId = user?.vendorId || appObj.vendor?.vendorId || null;
    }

    return res.status(200).json({
      success: true,
      application: appObj,
    });
  } catch (error) {
    console.error('Get vendor application error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor application.',
      error: error.message,
    });
  }
};

const approveVendorApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // 1. Find the application
    console.log('Searching for application with ID:', applicationId);
    let application = await VendorApplication.findOne({
      $or: [
        { applicationId: applicationId },
        { email: applicationId.toLowerCase() },
        ...(mongoose.isValidObjectId(applicationId)
          ? [{ _id: applicationId }]
          : []),
      ],
    });

    if (!application) {
      // Fallback: check if User exists directly
      const escapedAppId = applicationId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const user = await User.findOne({
        $or: [
          { vendorId: { $regex: new RegExp(`^${escapedAppId}$`, 'i') } },
          { email: applicationId.toLowerCase() },
          ...(mongoose.isValidObjectId(applicationId)
            ? [{ _id: applicationId }]
            : []),
        ],
      });

      if (user) {
        const {
          user: updatedUser,
          vendorId,
          password,
        } = await createOrUpdateVendorAccount({
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        });

        return res.status(200).json({
          success: true,
          message: 'Vendor credentials generated successfully.',
          vendor: {
            id: updatedUser._id,
            vendorId: updatedUser.vendorId,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            role: updatedUser.role,
          },
          credentials: {
            vendorId,
            password,
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Vendor application not found.',
      });
    }

    if (application.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'This application was rejected and cannot be approved.',
      });
    }

    // 2. Create/Update User & VendorProfile using shared utility
    const { user, vendorProfile, vendorId, password } =
      await createOrUpdateVendorAccount({
        fullName: application.fullName,
        email: application.email,
        phoneNumber: application.phoneNumber,
        specialization: application.specialOption || application.serviceType,
        serviceType: application.serviceType,
        experience: application.experience,
        experienceDescription: application.experienceDescription,
        serviceAddress: application.city,
      });

    // 3. Update application status and vendor reference
    application.status = 'Approved';
    application.vendor = vendorProfile._id;
    await application.save();

    // 4. Send response with valid vendor credentials

    return res.status(200).json({
      success: true,
      message: 'Vendor credentials generated successfully.',
      application: {
        applicationId: application.applicationId,
        status: application.status,
      },
      vendor: {
        id: user._id,
        vendorId: user.vendorId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      credentials: {
        vendorId,
        password,
      },
    });
  } catch (error) {
    console.error('Approve vendor application error:', error);

    return res.status(500).json({
      success: false,
      message:
        'Failed to approve vendor application. Error: ' +
        (error.message || error),
    });
  }
};



const getVendorCredentials = async (req, res) => {
  try {
    const { applicationId } = req.params;

    
    const application = await VendorApplication.findOne({
      $or: [
        { applicationId },
        { email: applicationId.toLowerCase() },
        ...(mongoose.isValidObjectId(applicationId)
          ? [{ _id: applicationId }]
          : []),
      ],
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Vendor application not found.',
      });
    }

    if (!application.vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor has not been approved yet.',
      });
    }

    
    const vendorProfile = await VendorProfile.findById(
      application.vendor
    );

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    
    const user = await User.findById(vendorProfile.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Vendor user not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor credentials retrieved successfully.',

      vendor: {
        id: user._id,
        vendorId: user.vendorId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },

      credentials: {
        vendorId: user.vendorId,
        temporaryPassword: vendorProfile.temporaryPassword,
      },
    });
  } catch (error) {
    console.error(
      'Get vendor credentials error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve vendor credentials.',
    });
  }
};


const rejectVendorApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application
    const application = await VendorApplication.findOne({
      $or: [
        { applicationId: applicationId },
        ...(mongoose.isValidObjectId(applicationId)
          ? [{ _id: applicationId }]
          : []),
      ],
    });

    // Application not found
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Vendor application not found.',
      });
    }

    // Application must be pending
    if (application.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}.`,
      });
    }

    // Change application status
    application.status = 'Rejected';

    // Save changes
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Vendor application rejected successfully.',
      application: {
        applicationId: application.applicationId,
        status: application.status,
      },
    });
  } catch (error) {
    console.error('Reject vendor application error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to reject vendor application.',
    });
  }
};

// Create vendor by Admin (Checks if vendor with same email already exists)
const createVendorByAdmin = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      specialization,
      serviceArea,
      experience,
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email are required.',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const cleanPhone = phoneNumber ? phoneNumber.trim() : '';

    // Check if vendor already exists for this email OR phone number
    const existingVendor = await checkVendorExistsByEmailOrPhone(
      trimmedEmail,
      cleanPhone,
    );
    if (existingVendor) {
      const matchField =
        existingVendor.email === trimmedEmail
          ? 'email address'
          : 'mobile number';
      const matchedVal =
        existingVendor.email === trimmedEmail ? trimmedEmail : cleanPhone;
      return res.status(409).json({
        success: false,
        message: `A vendor account is already registered with this ${matchField} "${matchedVal}" (Vendor ID: ${existingVendor.vendorId || 'Assigned'}). A new ID cannot be generated.`,
        vendorId: existingVendor.vendorId,
      });
    }

    const { user, vendorId, temporaryPassword } =
      await createOrUpdateVendorAccount({
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
      message:
        'Failed to create vendor credentials. Error: ' +
        (error.message || error),
    });
  }
};

module.exports = {
  createVendorApplication,
  getAllVendorApplications,
  getVendorApplicationById,
  approveVendorApplication,
  getVendorCredentials,
  rejectVendorApplication,
  createVendorByAdmin,
};
