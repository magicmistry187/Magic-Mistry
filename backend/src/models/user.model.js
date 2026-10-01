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
      select: false,
    },
    phoneNumber: {
      type: String,
      // unique: true,
      sparse: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ['customer', 'admin', 'vendor'],
      default: 'customer',
    },

    //Admin approval for vendors
    isApproved: {
      type: Boolean,
      default: false,
    },

    
    status: {
      type: String,
      enum: ['active', 'blocked', 'suspended'],
      default: 'active',
    },

    //When user get suspended , so their date will mention here like at what date user will get suspended
    suspendedUntil : {
       type: Date,
       default: null,
    },

    vendorId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProviders: {
      type: [
        {
          type: String,
          enum: ['email', 'google'],
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
