const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    addressType: {
      type: String,
      enum: ["Home", "Office", "Other"],
      default: "Home",
    },

    // house / flat / building — kept alongside addressLine1 for backwards compatibility
    house: {
      type: String,
      trim: true,
      default: "",
    },

    addressLine1: {
      type: String,
      trim: true,
      required: true,
    },

    street: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
      default: "",
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
      default: "India",
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
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
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

// Ensure location is omitted completely if coordinates are missing or invalid
addressSchema.pre('validate', function (next) {
  if (
    !this.location ||
    !Array.isArray(this.location.coordinates) ||
    this.location.coordinates.length !== 2 ||
    isNaN(Number(this.location.coordinates[0])) ||
    isNaN(Number(this.location.coordinates[1]))
  ) {
    this.location = undefined;
  } else if (!this.location.type) {
    this.location.type = 'Point';
  }
  next();
});

// Indexes
addressSchema.index({ user: 1 });
addressSchema.index({ location: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Address', addressSchema);
