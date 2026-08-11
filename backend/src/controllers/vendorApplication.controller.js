const VendorApplication = require('../models/vendorApplication.model');

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
      application: {
        applicationId: application.applicationId,
        status: application.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createVendorApplication,
};