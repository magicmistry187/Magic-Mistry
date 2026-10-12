
// const mongoose = require('mongoose');

// const fuelClaimSchema = new mongoose.Schema(
//   {
//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },

//     booking: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Booking',
//       required: true,
//       unique: true,
//     },

//     workOrderId: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     claimAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     vehicleType: {
//       type: String,
//       enum: [
//         'Company',
//         '2-Wheeler',
//         '3-Wheeler',
//         '4-Wheeler',
//       ],
//       required: true,
//     },

//     distanceKm: {
//       type: Number,
//       required: true,
//       min: 0.1,
//     },

//     reason: {
//       type: String,
//       trim: true,
//       default: '',
//     },

//     receipt: {
//       url: {
//         type: String,
//         default: null,
//       },
//       fileId: {
//         type: String,
//         default: null,
//       },
//     },

//     mapProof: {
//       url: {
//         type: String,
//         default: null,
//       },
//       fileId: {
//         type: String,
//         default: null,
//       },
//     },

//     status: {
//       type: String,
//       enum: [
//         'Pending',
//         'Approved',
//         'Rejected',
//       ],
//       default: 'Pending',
//     },

//     reviewedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       default: null,
//     },

//     reviewedAt: {
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
//   'FuelClaim',
//   fuelClaimSchema
// );

///------------------new model----------------------


const mongoose = require('mongoose');

// Stores vendor fuel claims, supporting documents, and admin review.
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
      enum: [
        'Company',
        '2-Wheeler',
        '3-Wheeler',
        '4-Wheeler',
      ],
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

    receipt: {
      url: { type: String, default: '' },
      fileId: { type: String, default: '' },
    },

    mapProof: {
      url: { type: String, default: '' },
      fileId: { type: String, default: '' },
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
  { timestamps: true }
);

module.exports = mongoose.model('FuelClaim', fuelClaimSchema);