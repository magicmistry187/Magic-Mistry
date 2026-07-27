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
      enum: [
        'AC Repair',
        'Refrigerator',
        'Washing Machine',
        'Microwave',
        'Mixer Grinder',
        'Water Pump',
        'Air Cooler',
        'Induction Cooktop',
        'Stabilizer',
        'Press Iron',
      ],
      required: true,
    },

    issue: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    address: {
      type: String,
      required: true,
      trim: true,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      enum: [
        '09:00 AM - 11:00 AM',
        '11:00 AM - 01:00 PM',
        '02:00 PM - 04:00 PM',
        '04:00 PM - 06:00 PM',
        '06:00 PM - 08:00 PM',
      ],
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

module.exports = mongoose.model('Booking', bookingSchema);
