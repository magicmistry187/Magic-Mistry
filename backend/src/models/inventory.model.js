const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
   
    inventoryId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    
    category: {
      type: String,
      required: true,
      trim: true,
    },

   
    skuCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Stock level at which item becomes "Low Stock"
    reorderThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },

    
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

   
    supplierName: {
      type: String,
      trim: true,
      default: "",
    },

    // Whether this inventory item is active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Last time this item was restocked
    lastRestockedAt: {
      type: Date,
      default: null,
    },

    // // Admin/user who created the item
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   default: null,
    // },
  },
  {
    timestamps: true,
  }
);


// Calculate total value of current stock
inventorySchema.virtual("totalValue").get(function () {
  return this.stockQuantity * this.unitPrice;
});


// Calculate current stock status
inventorySchema.virtual("stockStatus").get(function () {
  if (this.stockQuantity === 0) {
    return "Out of Stock";
  }

  if (this.stockQuantity <= this.reorderThreshold) {
    return "Low Stock";
  }

  return "In Stock";
});


// Include virtual fields when converting to JSON
inventorySchema.set("toJSON", {
  virtuals: true,
});

inventorySchema.set("toObject", {
  virtuals: true,
});


module.exports = mongoose.model("Inventory", inventorySchema);