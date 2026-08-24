const User = require('../models/user.model');
const VendorProfile = require('../models/vendorProfile.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

/**
 * Checks if a vendor already exists with the given email OR mobile/phone number.
 * @param {string} email
 * @param {string} phoneNumber
 * @returns {Promise<object|null>}
 */
const checkVendorExistsByEmailOrPhone = async (email, phoneNumber) => {
  const query = [];
  if (email && email.trim()) {
    query.push({ email: email.toLowerCase().trim() });
  }
  if (phoneNumber && phoneNumber.trim()) {
    query.push({ phoneNumber: phoneNumber.trim() });
  }
  if (query.length === 0) return null;

  const user = await User.findOne({
    $or: query,
    $and: [
      {
        $or: [{ role: 'vendor' }, { vendorId: { $exists: true, $ne: null } }],
      },
    ],
  });

  return user;
};

// Keep checkVendorExistsByEmail as backward-compatible alias
const checkVendorExistsByEmail = (email) =>
  checkVendorExistsByEmailOrPhone(email, null);

/**
 * Generates a unique vendor ID format: FX-V-XXXX
 */
const generateVendorId = () => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `FX-V-${randomSuffix}`;
};

/**
 * Creates or updates a User with vendor role and provisions a VendorProfile with generated credentials.
 */

const createOrUpdateVendorAccount = async ({
  fullName,
  email,
  phoneNumber,
  specialization,
  serviceType,
  experience,
  experienceDescription,
  serviceAddress,
}) => {
  const trimmedEmail = email.toLowerCase().trim();

  let user = await User.findOne({
    email: trimmedEmail,
  }).select('+password');

  let vendorId;
  let temporaryPassword = null;

  

  if (!user) {
  
    vendorId = generateVendorId();

   
    temporaryPassword = `FixIt_${new Date().getFullYear()}_!${crypto
      .randomBytes(2)
      .toString('hex')}`;

  
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    
    user = await User.create({
      fullName: fullName?.trim(),
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

  
  else {
    vendorId = user.vendorId || generateVendorId();

    user.fullName = fullName?.trim() || user.fullName;

    if (phoneNumber) {
      user.phoneNumber = phoneNumber.trim();
    }

    user.role = 'vendor';
    user.isApproved = true;
    user.status = 'active';
    user.vendorId = vendorId;

    if (!user.authProviders.includes('email')) {
      user.authProviders.push('email');
    }


    await user.save();
  }

 

  let vendorProfile = await VendorProfile.findOne({
    user: user._id,
  });

  if (!vendorProfile) {
    // If somehow user existed but VendorProfile didn't,
    // generate credentials only if there is no existing password.
    if (!temporaryPassword && !user.password) {
      temporaryPassword = `FixIt_${new Date().getFullYear()}_!${crypto
        .randomBytes(2)
        .toString('hex')}`;

      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      user.password = hashedPassword;
      await user.save();
    }

    vendorProfile = await VendorProfile.create({
      user: user._id,
      vendorId: user.vendorId,

      temporaryPassword: temporaryPassword,

      professionalTitle: specialization || 'Service Technician',

      serviceType: serviceType || specialization || 'General',

      experience: Number(experience) || 0,

      experienceDescription: experienceDescription || 'Application Approved',

      serviceAddress: serviceAddress || '',

      profileImage: {
        url: null,
        fileId: null,
      },

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
  }

  
  else {
    vendorProfile.vendorId = user.vendorId;

    if (specialization) {
      vendorProfile.professionalTitle = specialization;
    }

    if (serviceType) {
      vendorProfile.serviceType = serviceType;
    }

    if (experience !== undefined) {
      vendorProfile.experience = Number(experience);
    }

    if (experienceDescription) {
      vendorProfile.experienceDescription = experienceDescription;
    }

    if (serviceAddress) {
      vendorProfile.serviceAddress = serviceAddress;
    }

  

    await vendorProfile.save();
  }

  return {
    user,
    vendorProfile,
    vendorId: user.vendorId,
    temporaryPassword: temporaryPassword || vendorProfile.temporaryPassword,
  };
};

module.exports = {
  checkVendorExistsByEmail,
  checkVendorExistsByEmailOrPhone,
  createOrUpdateVendorAccount,
};
