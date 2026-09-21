const mongoose = require('mongoose');

const vendorEarningSchema = new mongoose.Schema(
  {
    // ==========================================
    // REFERENCES
    // ==========================================

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ==========================================
    // WORK ORDER
    // ==========================================

    workOrderId: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // CUSTOMER INVOICE
    // ==========================================

    customerInvoiceAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // SERVICE EARNING
    // ==========================================

    serviceAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    serviceSharePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    serviceShareAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // COMPONENT
    // ==========================================

    componentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    componentShareAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // TRAVEL / FUEL
    // ==========================================

    travelDistanceKm: {
      type: Number,
      default: 0,
      min: 0,
    },

    travelRatePerKm: {
      type: Number,
      default: 10,
      min: 0,
    },

    fuelPayout: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // FINAL EARNING
    // ==========================================

    netEarning: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        'Available',
        'Included In Payout',
        'Paid',
      ],
      default: 'Available',
    },

    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'VendorEarning',
  vendorEarningSchema
);