
const mongoose = require('mongoose');


const payoutSchema = new mongoose.Schema(
  {
    
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    
    earnings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorEarning',
      },
    ],

  
    serviceEarningAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    
    travelEarningAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

   
    daysOfWork: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Days of work must be a whole number.',
      },
    },

    
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

 
    // payoutMethod: {
    //   type: String,
    //   enum: ['UPI', 'Bank Transfer'],
    //   required: true,
    // },

   
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

    // Optional notes submitted by the vendor.
    settlementNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },

    // Notes added by the admin during review.
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },

    // Transaction reference recorded when payment is made.
    transactionId: {
      type: String,
      trim: true,
      default: '',
    },

    // Date when the vendor submitted the request.
    requestedAt: {
      type: Date,
      default: Date.now,
    },

    // Date when the payout was processed.
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payout', payoutSchema);