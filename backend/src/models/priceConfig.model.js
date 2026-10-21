const mongoose = require('mongoose');

const pricingConfigSchema = new mongoose.Schema(
  {
    fuelRatePerKm: {
      type: Number,
      required: true,
      min: 0,
      default: 8,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('PricingConfig', pricingConfigSchema);
