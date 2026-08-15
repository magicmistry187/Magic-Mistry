const mongoose = require('mongoose');

const vendorApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      required: true,
    },

    // Personal Information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    specialOption: {
      type: String,
      trim: true,
      required: true,
    },

    // Work Details
    serviceType: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    experienceDescription: {
      type: String,
      required: true,
      trim: true,
    },

    // Documents
    documents: [
      {
        type: {
          type: String,
          //   enum: ['Aadhaar', 'Skill Badge', 'Other'],
          required: true,
        },

        url: {
          type: String,
          required: true,
        },

        fileName: {
          type: String,
        },

        fileId: {
          type: String,
        },
      },
    ],

    // Application Status
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    // Created after approval
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('VendorApplication', vendorApplicationSchema);
