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
         default: null,
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


   checklist: {
  service: {
    type: Boolean,
    default: false,
  },

  inspection: {
    type: Boolean,
    default: false,
  },

  diagnosis: {
    type: Boolean,
    default: false,
  },

  testingCleanup: {
    type: Boolean,
    default: false,
  },
},

   documentation: {
  beforeImage: {
    url: {
      type: String,
      default: null,
    
    },
    fileId: {
      type: String,
      default: null,
      
    },
  },

  afterImage: {
    url: {
      type: String,
       default: null,
      
    },
    fileId: {
      type: String,
       default: null,
      
    },
  },
},
    

    customerNote: {
      type: String,
      trim: true,
      default: '',
    },

  

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