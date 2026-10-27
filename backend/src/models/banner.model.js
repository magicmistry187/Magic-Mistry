const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Flat ₹150 OFF on all AC & Appliance Repairs',
    },
    badgeText: {
      type: String,
      trim: true,
      default: 'FESTIVE SALE',
    },
    badgeEmoji: {
      type: String,
      default: '🔥',
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'MAGIC150',
    },
    subtext: {
      type: String,
      trim: true,
      default: 'Valid on AC, Refrigerator, and Washing Machine repairs',
    },
    ctaText: {
      type: String,
      trim: true,
      default: 'Book Now',
    },
    ctaLink: {
      type: String,
      trim: true,
      default: '/booking',
    },
    theme: {
      type: String,
      enum: ['sunset', 'sapphire', 'emerald', 'gold', 'neon', 'custom'],
      default: 'sunset',
    },
    gradientStart: {
      type: String,
      default: '#02182e',
    },
    gradientMiddle: {
      type: String,
      default: '#1e3a8a',
    },
    gradientEnd: {
      type: String,
      default: '#f97316',
    },
    textColor: {
      type: String,
      default: '#ffffff',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    countdownExpiry: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    isCountdownEnabled: {
      type: Boolean,
      default: true,
    },
    isDismissible: {
      type: Boolean,
      default: true,
    },
    placement: {
      type: String,
      enum: ['top-bar', 'popup', 'both', 'hero', 'all'],
      default: 'all',
    },
    isPopupEnabled: {
      type: Boolean,
      default: true,
    },
    popupDelay: {
      type: Number,
      default: 0.4,
    },
    popupFloatingTrigger: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
