const mongoose = require('mongoose');

const serviceExecutionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ==========================================
    // ROUTE / TRAVEL VERIFICATION
    // ==========================================

    route: {
      screenshot: {
        url: {
          type: String,
          default: null,
        },
        fileId: {
          type: String,
          default: null,
        },
      },

      vendorOrigin: {
        latitude: {
          type: Number,
          default: null,
        },
        longitude: {
          type: Number,
          default: null,
        },
      },

      customerDestination: {
        latitude: {
          type: Number,
          default: null,
        },
        longitude: {
          type: Number,
          default: null,
        },
      },

      distanceKm: {
        type: Number,
        min: 0,
        default: 0,
      },

      ratePerKm: {
        type: Number,
        min: 0,
        required: true,
      },

      travelCharge: {
        type: Number,
        min: 0,
        default: 0,
      },

      addToInvoice: {
        type: Boolean,
        default: true,
      },

      verified: {
        type: Boolean,
        default: false,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================
    // SERVICE TIME
    // ==========================================

    arrivedAt: {
      type: Date,
      default: null,
    },

    serviceStartedAt: {
      type: Date,
      default: null,
    },

    serviceCompletedAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // SERVICE CHECKLIST
    // ==========================================

    checklist: [
      {
        key: {
          type: String,
          required: true,
        },

        title: {
          type: String,
          required: true,
        },

        completed: {
          type: Boolean,
          default: false,
        },

        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],

    // ==========================================
    // BEFORE / AFTER DOCUMENTATION
    // ==========================================

    documentation: {
      beforeImages: [
        {
          url: {
            type: String,
            required: true,
          },

          fileId: {
            type: String,
            required: true,
          },
        },
      ],

      afterImages: [
        {
          url: {
            type: String,
            required: true,
          },

          fileId: {
            type: String,
            required: true,
          },
        },
      ],
    },

    // ==========================================
    // NOTES
    // ==========================================

    customerNote: {
      type: String,
      trim: true,
      default: '',
    },

    vendorNote: {
      type: String,
      trim: true,
      default: '',
    },

    // ==========================================
    // SERVICE STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        'Route Pending',
        'Route Verified',
        'In Progress',
        'Completed',
      ],
      default: 'Route Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'ServiceExecution',
  serviceExecutionSchema
);