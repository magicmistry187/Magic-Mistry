const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    serviceExecution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceExecution',
      required: true,
      unique: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customerSnapshot: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        default: '',
      },

      address: {
        type: String,
        required: true,
      },
    },

    serviceSnapshot: {
      appliance: {
        type: String,
        required: true,
      },

      serviceCategory: {
        type: String,
        default: '',
      },

      serviceDate: {
        type: Date,
        required: true,
      },
    },

    items: [
      {
        type: {
          type: String,
          enum: ['Service', 'Travel', 'Component', 'Warranty'],
          required: true,
        },

        name: {
          type: String,
          required: true,
          trim: true,
        },

        // Used only for Component items
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Inventory',
          default: null,
        },

        quantity: {
          type: Number,
          required: true,
          min: 0,
          default: 1,
        },

        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      min: 0,
      default: 0,
    },

    tax: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      // type: String,
      // enum: ['Cash', 'UPI'],
      // required: true,
      type: String,
      required: true,
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },

    paidAt: {
      type: Date,
      default: null,
    },

    customerNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Invoice', invoiceSchema);
