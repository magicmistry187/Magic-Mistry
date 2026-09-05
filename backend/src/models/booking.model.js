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
      // enum: [
      //   'AC Repair',
      //   'Refrigerator',
      //   'Washing Machine',
      //   'Microwave',
      //   'Mixer Grinder',
      //   'Water Pump',
      //   'Air Cooler',
      //   'Induction Cooktop',
      //   'Stabilizer',
      //   'Press Iron',
      // ],
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
    //   Reference  of customer saved address in its profile
    // refAddress: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Address',
    //   default: null,
    // },

   // Address snapshot at the time of booking
address: {
  type: mongoose.Schema.Types.Mixed,
  required: true,
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

module.exports = mongoose.model('Booking', bookingSchema);
