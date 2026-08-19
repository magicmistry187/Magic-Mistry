const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
  // Link this vendor profile to the User account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  vendorId: {
    type: String,
    sparse: true,
    trim: true,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  professionalTitle: {
    type: String,
    trim: true,
    default: null,
  },

  serviceType: {
    type: String,
    trim: true,
    default: null,
  },

  appliancesServed: {
    type: [String],
    default: [],
  },

  experience: {
    type: Number,
    default: 0,
    min: 0,
  },

  experienceDescription: {
    type: String,
    trim: true,
    default: null,
  },

  serviceRadius: {
    type: Number,
    default: 0,
    min: 0,
  },

  serviceAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    default: null,
  },

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },

  jobsCompleted: {
    type: Number,
    default: 0,
    min: 0,
  },

  

  // Payment details
  vendorUpiId: {
    type: String,
    trim: true,
    default: null,
  },

  bankDetails: {
    bankName: {
      type: String,
      trim: true,
      default: null,
    },

    accountNumber: {
      type: String,
      trim: true,
      default: null,
    },

    ifsc: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
  },
  certification: {
    name: {
      type: String,
      trim: true,
      default: null,
    },

    certificationId: {
      type: String,
      trim: true,
      default: null,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
}, {
    timestamps: true,
  });

  module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
