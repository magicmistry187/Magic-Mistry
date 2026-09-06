const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    appliance: {
      type: String,
      required: true,
    },

    serviceCategory: {
      type: String,
      required: true,
      trim: true,
    },
    serviceCategoryCharge: {
      type: Number,
      required: true,
      min: 0,
    },

    issue: {
      type: String,
      // required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    

    // Address snapshot at the time of booking
    address: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    //   GeoJSON Point for the address location
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'On The Way',
        'In Progress',
        'Completed',
        'Cancelled',
        'Closed',
      ],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash After Service', 'UPI', 'Online Payment'],
      default: 'Cash After Service',
    },
    serviceCharge: {
      type: Number,
      // required: true,
      min: 0,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

//---------------------------Index--------------

// Customer's booking history (latest bookings first)
bookingSchema.index({ customer: 1, createdAt: -1 });

// Vendor's bookings by status
bookingSchema.index({ vendor: 1, bookingStatus: 1 });

// Admin dashboard (filter bookings by status and date)
bookingSchema.index({ bookingStatus: 1, serviceDate: 1 });


//here Mushhh - ADD
bookingSchema.index({location: '2dsphere'});

module.exports = mongoose.model('Booking', bookingSchema);
