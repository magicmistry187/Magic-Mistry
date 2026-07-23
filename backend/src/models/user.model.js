const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'vendor'],
      default: 'customer',
    },

    
    // Admin approval for vendors
    isApproved: {
      type: Boolean,
      default: false,
    },

    // when vendor is blocked by admin, he cannot login to the system.
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
  }, // it automatically add createdAt and updatedAt
  { timestamps: true },
);


module.exports = mongoose.model('User',userSchema)