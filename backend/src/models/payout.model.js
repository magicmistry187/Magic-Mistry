const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    payoutMethod: {
      type: String,
      enum: [
        'UPI',
        'Bank Transfer',
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        'Requested',
        'Processing',
        'Paid',
        'Rejected',
        'Failed',
      ],
      default: 'Requested',
    },

    transactionId: {
      type: String,
      trim: true,
      default: null,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    processedAt: {
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
  'Payout',
  payoutSchema
);