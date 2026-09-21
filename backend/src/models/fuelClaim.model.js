const mongoose = require('mongoose');

const fuelClaimSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },

    workOrderId: {
      type: String,
      required: true,
      trim: true,
    },

    claimAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    vehicleType: {
      type: String,
      trim: true,
      default: '',
    },

    distanceKm: {
      type: Number,
      min: 0,
      default: 0,
    },

    reason: {
      type: String,
      trim: true,
      default: '',
    },

    // Receipt uploaded by vendor
    receipt: {
      url: {
        type: String,
        default: null,
      },

      fileId: {
        type: String,
        default: null,
      },
    },

    // Map proof uploaded by vendor
    mapProof: {
      url: {
        type: String,
        default: null,
      },

      fileId: {
        type: String,
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Rejected',
      ],
      default: 'Pending',
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'FuelClaim',
  fuelClaimSchema
);