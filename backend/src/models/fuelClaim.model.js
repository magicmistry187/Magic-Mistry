const mongoose = require('mongoose');

const fuelClaimSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },

    claimAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    vehicleType: {
      type: String,
      enum: ['Company', '2-Wheeler', '3-Wheeler', '4-Wheeler'],
      required: true,
    },

    distanceKm: {
      type: Number,
      required: true,
      min: 0.1,
    },

    reason: {
      type: String,
      trim: true,
      required: true,
    },

    proofs: {
      petrolReceipt: {
        url: { type: String, default: '' },
        fileId: { type: String, default: '' },
      },

      mapProof: {
        url: { type: String, default: '' },
        fileId: { type: String, default: '' },
      },

      odometer: {
        url: { type: String, default: '' },
        fileId: { type: String, default: '' },
      },
    },

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
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

    // Set when this claim is included in a payout.
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout',
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('FuelClaim', fuelClaimSchema);
