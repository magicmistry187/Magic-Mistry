
const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema(
  {
   
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "🔧",
      trim: true,
    },

    // Appliance, Cooling, Cleaning, Kitchen, etc.
    groupCategory: {
      type: String,
      required: true,
      trim: true,
      default: "Appliance",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

   
    baseDiagnosticAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    
    subServices: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },

        customerPrice: {
          type: Number,
          required: true,
          min: 0,
        },

        
        isVisible: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

serviceCategorySchema.index({
  isVisible: 1,
  categoryName: 1,
});

const ServiceCategory = mongoose.model(
  "ServiceCategory",
  serviceCategorySchema
);

module.exports = ServiceCategory;
