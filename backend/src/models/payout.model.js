// const mongoose = require('mongoose');

// const payoutSchema = new mongoose.Schema(
//   {
//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     payoutMethod: {
//       type: String,
//       enum: [
//         'UPI',
//         'Bank Transfer',
//       ],
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: [
//         'Requested',
//         'Processing',
//         'Paid',
//         'Rejected',
//         'Failed',
//       ],
//       default: 'Requested',
//     },

//     transactionId: {
//       type: String,
//       trim: true,
//       default: null,
//     },

//     requestedAt: {
//       type: Date,
//       default: Date.now,
//     },

//     processedAt: {
//       type: Date,
//       default: null,
//     },

//     adminNote: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model(
//   'Payout',
//   payoutSchema
// );

// ----------------new  model---------


const mongoose = require('mongoose');

// Stores the combined payment request displayed to the admin.
const payoutSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Individual booking earnings included in this request.
    earnings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorEarning',
      },
    ],

    // Approved fuel claims included in this request.
    fuelClaims: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FuelClaim',
      },
    ],

    // Breakdown of the requested amount.
    serviceEarningAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    travelEarningAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    fuelClaimAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total amount requested by the vendor.
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    payoutMethod: {
      type: String,
      enum: ['UPI', 'Bank Transfer'],
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
      index: true,
    },

    transactionId: {
      type: String,
      trim: true,
      default: '',
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
  { timestamps: true }
);

module.exports = mongoose.model('Payout', payoutSchema);