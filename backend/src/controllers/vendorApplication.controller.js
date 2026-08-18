const VendorApplication = require('../models/vendorApplication.model');
const User = require('../models/user.model');
const Vendor = require('../models/vendorProfile.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const uploadImageToImageKit = require('../config/imagekit');

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
      !experience ||
      !experienceDescription
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided.',
      });
    }

    // 2. Checking  application already existing or not
    const existingApplication = await VendorApplication.findOne({
      email: email.toLowerCase().trim(),
      status: 'Pending',
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending vendor application.',
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
      // application: {
      //   applicationId: application.applicationId,
      //   status: application.status,
      // },
      application,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllVendorApplications = async (req, res) => {
  try {
    const applications = await VendorApplication.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      applications,
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
      applicationId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Vendor application not found.',
      });
    }

    return res.status(200).json({
      success: true,
      application,
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
    console.log('Approving vendor application...');
    const { applicationId } = req.params;

    // 1. Find the application
    const application = await VendorApplication.findOne({
      $or: [
        { applicationId: applicationId },
        ...(mongoose.isValidObjectId(applicationId) ? [{ _id: applicationId }] : []),
      ],
    });

    if (!application) {
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

    const trimmedEmail = application.email.toLowerCase().trim();

    // 2. Find if user exists
    let user = await User.findOne({
      email: trimmedEmail,
    });

    // 3. Generate credentials
    const vendorId = user?.vendorId || `FX-V-${Math.floor(1000 + Math.random() * 9000)}`;
    const temporaryPassword = `FixIt_${new Date().getFullYear()}_!${crypto
      .randomBytes(2)
      .toString('hex')}`;
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    if (user) {
      // Update existing user to vendor role
      user.fullName = application.fullName || user.fullName;
      user.phoneNumber = application.phoneNumber || user.phoneNumber;
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
      // Create new vendor user
      user = await User.create({
        fullName: application.fullName.trim(),
        email: trimmedEmail,
        phoneNumber: application.phoneNumber ? application.phoneNumber.trim() : '',
        password: hashedPassword,
        role: 'vendor',
        authProviders: ['email'],
        status: 'active',
        isApproved: true,
        vendorId,
      });
    }

    // 4. Create or update VendorProfile
    let vendor = await Vendor.findOne({ user: user._id });

    if (!vendor) {
      vendor = await Vendor.create({
        user: user._id,
        professionalTitle: application.specialOption || 'Service Technician',
        serviceType: application.serviceType || 'General',
        experience: Number(application.experience) || 0,
        experienceDescription: application.experienceDescription || 'Application Approved',
        serviceAddress: application.city || '',
        profilePhoto: null,
        appliancesServed: [],
        serviceRadius: 0,
        rating: 0,
        jobsCompleted: 0,
        vendorUpiId: null,
        bankDetails: {
          bankName: null,
          accountNumber: null,
          ifsc: null,
        },
        certification: {
          name: null,
          certificationId: null,
          verified: false,
        },
      });
    } else {
      vendor.professionalTitle = application.specialOption || vendor.professionalTitle;
      vendor.serviceType = application.serviceType || vendor.serviceType;
      vendor.experience = Number(application.experience) || vendor.experience;
      vendor.experienceDescription = application.experienceDescription || vendor.experienceDescription;
      vendor.serviceAddress = application.city || vendor.serviceAddress;
      await vendor.save();
    }

    // 5. Update application
    application.status = 'Approved';
    application.vendor = vendor._id;
    await application.save();

    // 6. Send response with valid vendor credentials
    return res.status(200).json({
      success: true,
      message: 'Vendor application approved and credentials generated successfully.',
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
        temporaryPassword,
      },
    });
  } catch (error) {
    console.error('Approve vendor application error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to approve vendor application. Error: ' + (error.message || error),
    });
  }
};

const rejectVendorApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application
    const application = await VendorApplication.findOne({
      applicationId,
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

module.exports = {
  createVendorApplication,
  getAllVendorApplications,
  getVendorApplicationById,
  approveVendorApplication,
  rejectVendorApplication,
};
