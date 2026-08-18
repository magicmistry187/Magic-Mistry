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
const checkVendorExistsByEmail = (email) => checkVendorExistsByEmailOrPhone(email, null);

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
  let user = await User.findOne({ email: trimmedEmail });

  // 1. Generate vendor credentials (preserve existing vendorId if already set)
  const vendorId = user?.vendorId || generateVendorId();
  const temporaryPassword = `FixIt_${new Date().getFullYear()}_!${crypto
    .randomBytes(2)
    .toString('hex')}`;
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  // 2. Create or update User document
  if (user) {
    user.fullName = fullName?.trim() || user.fullName;
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

  // 3. Create or update VendorProfile document
  let vendorProfile = await VendorProfile.findOne({ user: user._id });
  if (!vendorProfile) {
    vendorProfile = await VendorProfile.create({
      user: user._id,
      vendorId: user.vendorId,
      professionalTitle: specialization || 'Service Technician',
      serviceType: serviceType || specialization || 'General',
      experience: Number(experience) || 0,
      experienceDescription: experienceDescription || 'Application Approved',
      serviceAddress: serviceAddress || '',
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
    vendorProfile.vendorId = user.vendorId;
    if (specialization) vendorProfile.professionalTitle = specialization;
    if (serviceType) vendorProfile.serviceType = serviceType;
    if (experience !== undefined) vendorProfile.experience = Number(experience);
    if (experienceDescription) vendorProfile.experienceDescription = experienceDescription;
    if (serviceAddress) vendorProfile.serviceAddress = serviceAddress;
    await vendorProfile.save();
  }

  return {
    user,
    vendorProfile,
    vendorId: user.vendorId,
    temporaryPassword,
  };
};

module.exports = {
  checkVendorExistsByEmail,
  checkVendorExistsByEmailOrPhone,
  createOrUpdateVendorAccount,
};
