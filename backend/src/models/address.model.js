const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    addressType: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home',
    },
    
    house: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      trim: true,
    },

    street: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
      default: '',
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: 'India',
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
addressSchema.index({ user: 1 });
addressSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Address', addressSchema);
