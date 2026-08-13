const VendorApplication = require('../models/vendorApplication.model');
const User = require('../models/user.model');
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
      experience: experience.trim(),
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
    const { applicationId } = req.params;

    // 1. Find the application
    const application = await VendorApplication.findOne({
      applicationId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Vendor application not found.',
      });
    }

    // 2. Application must be pending
    if (application.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}.`,
      });
    }

    // 3. Check if user with this email already exists
    const existingUser = await User.findOne({
      email: application.email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // 4. Generate Vendor ID
    const vendorId = `FX-V-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Generate temporary password
    const temporaryPassword = `FixIt_${new Date().getFullYear()}_!${crypto
      .randomBytes(2)
      .toString('hex')}`;

    // 6. Hash temporary password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // 7. Create vendor account
    const vendor = await User.create({
      fullName: application.fullName,
      email: application.email,
      phoneNumber: application.phoneNumber,

      password: hashedPassword,

      vendorId,
      role: 'vendor',

      isApproved: true,
      status: 'active',
    });

    // 8. Update application
    application.status = 'Approved';
    application.vendor = vendor._id;

    await application.save();

    // 9. Send response
    return res.status(200).json({
      success: true,
      message: 'Vendor application approved successfully.',

      application: {
        applicationId: application.applicationId,
        status: application.status,
      },

      vendor: {
        id: vendor._id,
        vendorId: vendor.vendorId,
        fullName: vendor.fullName,
        email: vendor.email,
        role: vendor.role,
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
      message: 'Failed to approve vendor application.',
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
