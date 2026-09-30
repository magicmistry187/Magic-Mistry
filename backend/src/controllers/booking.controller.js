const Booking = require('../models/booking.model');
const Address = require('../models/address.model');
const VendorProfile = require('../models/vendorProfile.model');
const { uploadImageToImageKit } = require('../config/imagekit');
const ServiceExecution = require('../models/serviceExecution.model');
const Invoice = require('../models/invoice.model');
const {
  emitNewBooking,
  emitBookingStatusUpdated,
  emitBookingTaken,
  emitBookingCancelled,
} = require('../socket/socketEmitter');

exports.createBooking = async (req, res) => {
  try {
    let {
      appliance,
      issue,
      address,
      serviceDate,
      timeSlot,
      serviceCategory,
      serviceCategoryCharge,
      longitude,
      latitude,
    } = req.body;

    const selectedAppliance = appliance || serviceCategory;

    console.log(
      'Value of longitude and latitude came from frontend:  ',
      longitude,
      ',',
      latitude,
    );

    // If address was sent as multipart form-data bracket fields like address[addressLine1]
    if (
      !address &&
      (req.body['address[addressLine1]'] ||
        req.body['address[city]'] ||
        req.body['address[street]'])
    ) {
      address = {
        addressLine1: req.body['address[addressLine1]'] || '',
        street: req.body['address[street]'] || '',
        city: req.body['address[city]'] || '',
        state: req.body['address[state]'] || '',
        pincode: req.body['address[pincode]'] || '',
        landmark: req.body['address[landmark]'] || '',
        country: req.body['address[country]'] || 'India',
      };
    } else if (typeof address === 'string') {
      try {
        const parsed = JSON.parse(address);
        if (typeof parsed === 'object' && parsed !== null) {
          address = parsed;
        }
      } catch (_) {
        // Plain string address, retain as is
      }
    }

    // Validate required fields
    if (!selectedAppliance || !address || !serviceDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message:
          'All required fields (appliance, address, serviceDate, timeSlot) must be provided.',
      });
    }

    // Upload image if provided
    let image = '';

    if (req.file) {
      try {
        const result = await uploadImageToImageKit(
          req.file.buffer,
          req.file.originalname || `booking-${Date.now()}.jpg`,
        );
        image = result.url;
      } catch (error) {
        console.error('Image upload failed:', error);

        return res.status(500).json({
          success: false,
          message: 'Failed to upload image.',
        });
      }
    }

    // Create booking
    const bookingData = {
      customer: req.user.id,
      appliance: selectedAppliance,
      issue: issue || 'General Repair & Maintenance',
      image,
      address,
      serviceDate,
      timeSlot,
      serviceCategory: serviceCategory || selectedAppliance,
      serviceCategoryCharge: Number(serviceCategoryCharge),
    };

    let latNum =
      latitude !== null &&
      latitude !== undefined &&
      latitude !== '' &&
      !isNaN(Number(latitude))
        ? Number(latitude)
        : null;
    let lngNum =
      longitude !== null &&
      longitude !== undefined &&
      longitude !== '' &&
      !isNaN(Number(longitude))
        ? Number(longitude)
        : null;

    // Fallback: If coordinates were omitted, attempt extraction from address object or customer default Address
    if (latNum === null || lngNum === null) {
      if (typeof address === 'object' && address !== null) {
        if (
          address.location?.coordinates?.length === 2 &&
          !isNaN(Number(address.location.coordinates[0])) &&
          !isNaN(Number(address.location.coordinates[1]))
        ) {
          lngNum = Number(address.location.coordinates[0]);
          latNum = Number(address.location.coordinates[1]);
        } else if (
          address.latitude &&
          address.longitude &&
          !isNaN(Number(address.latitude)) &&
          !isNaN(Number(address.longitude))
        ) {
          latNum = Number(address.latitude);
          lngNum = Number(address.longitude);
        }
      }
    }

    if (latNum === null || lngNum === null) {
      try {
        const defaultAddr = await Address.findOne({ user: req.user.id, isDefault: true });
        if (defaultAddr?.location?.coordinates?.length === 2) {
          lngNum = Number(defaultAddr.location.coordinates[0]);
          latNum = Number(defaultAddr.location.coordinates[1]);
        }
      } catch (addrErr) {
        console.warn('[Booking] Could not fallback to default address coordinates:', addrErr);
      }
    }

    if (latNum !== null && lngNum !== null) {
      bookingData.location = {
        type: 'Point',
        coordinates: [lngNum, latNum],
      };
    }

    const booking = await Booking.create(bookingData);

    const populatedBooking = await Booking.findById(booking._id).populate(
      'customer',
      'fullName email phoneNumber',
    );

    // Real-time: notify vendors and admin immediately
    emitNewBooking(populatedBooking || booking);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking: populatedBooking || booking,
    });
  } catch (error) {
    console.error('Create Booking Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error.',
      error: error.message,
    });
  }
};

//gets all the booking
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get My Bookings Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings.',
      error: error.message,
    });
  }
};

// Get single booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    let query = { _id: bookingId };

    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    }

    if (req.user.role === 'vendor') {
      query.vendor = req.user.id;
    }

    const booking = await Booking.findOne(query)
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get Booking Details Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details.',
      error: error.message,
    });
  }
};
// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or you are not authorized to cancel it.',
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled.',
      });
    }

    if (booking.bookingStatus === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed bookings cannot be cancelled.',
      });
    }
    if (booking.bookingStatus === 'Accepted') {
      return res.status(400).json({
        success: false,
        message: 'Accepted bookings cannot be cancelled.',
      });
    }
    booking.bookingStatus = 'Cancelled';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber');

    emitBookingCancelled(populatedBooking || booking);

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking: populatedBooking || booking,
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking.',
      error: error.message,
    });
  }
};

exports.getBookingsToAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });
    // console.log('Bookings fetched:', bookings);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      message: 'All bookings fetched successfully.',
    });
  } catch (error) {
    console.error('Get All Bookings Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings.',
      error: error.message,
    });
  }
};

exports.getBookingsToVendor = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const bookings = await Booking.find({
      $or: [{ bookingStatus: 'Pending' }, { vendor: vendorId }],
    })
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      message: 'Vendor bookings fetched successfully.',
    });
  } catch (error) {
    console.error('Get Bookings to Vendor Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings.',
      error: error.message,
    });
  }
};

//Mushhh

exports.getBookingToVendorUnderRange = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // 1. Always fetch all bookings directly assigned to this vendor (Accepted, In Progress, Completed, Cancelled, etc.)
    const assignedBookings = await Booking.find({
      vendor: vendorId,
    })
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber')
      .lean();

    // 2. Fetch vendor profile & determine active location and radius
    const vendorProfile = await VendorProfile.findOne({ user: vendorId });
    const radius =
      Number(req.query.radius) ||
      (vendorProfile?.serviceRadius && vendorProfile.serviceRadius > 0
        ? vendorProfile.serviceRadius
        : 15);

    let vendorLocation = null;
    const vendorAddress = await Address.findOne({ user: vendorId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    if (
      vendorAddress?.location?.coordinates?.length === 2 &&
      !isNaN(vendorAddress.location.coordinates[0]) &&
      !isNaN(vendorAddress.location.coordinates[1])
    ) {
      vendorLocation = vendorAddress.location;
    }

    let pendingBookings = [];

    if (vendorLocation) {
      try {
        // GeoNear query for pending bookings within radius
        const geoPending = await Booking.aggregate([
          {
            $geoNear: {
              near: vendorLocation,
              key: 'location',
              distanceField: 'distance',
              maxDistance: radius * 1000,
              spherical: true,
              query: {
                bookingStatus: 'Pending',
                $or: [{ vendor: null }, { vendor: { $exists: false } }],
              },
            },
          },
          { $sort: { createdAt: -1 } },
        ]);

        await Booking.populate(geoPending, [
          { path: 'customer', select: 'fullName email phoneNumber' },
          { path: 'vendor', select: 'fullName email phoneNumber' },
        ]);

        // Also fetch pending bookings without location coordinates so they are never dropped
        const nonGeoPending = await Booking.find({
          bookingStatus: "Pending",
          $or: [{ vendor: null }, { vendor: { $exists: false } }],
          $or: [
            { location: { $exists: false } },
            { location: null },
            { "location.coordinates": { $exists: false } },
            { "location.coordinates": { $size: 0 } },
          ],
        })
          .populate("customer", "fullName email phoneNumber")
          .populate("vendor", "fullName email phoneNumber")
          .lean();

        pendingBookings = [...geoPending, ...nonGeoPending];
      } catch (geoErr) {
        console.warn("Geo query failed, falling back to all pending:", geoErr.message);
        pendingBookings = await Booking.find({
          bookingStatus: "Pending",
          $or: [{ vendor: null }, { vendor: { $exists: false } }],
        })
          .populate('customer', 'fullName email phoneNumber')
          .populate('vendor', 'fullName email phoneNumber')
          .lean();
      }
    } else {
      // Vendor has no address/coordinates configured yet -> return all pending bookings as fallback
      pendingBookings = await Booking.find({
        bookingStatus: "Pending",
        $or: [{ vendor: null }, { vendor: { $exists: false } }],
      })
        .populate("customer", "fullName email phoneNumber")
        .populate("vendor", "fullName email phoneNumber")
        .lean();
    }

    // Combine and deduplicate by booking ID
    const bookingMap = new Map();
    for (const b of assignedBookings) {
      bookingMap.set(String(b._id), b);
    }
    for (const b of pendingBookings) {
      if (!bookingMap.has(String(b._id))) {
        bookingMap.set(String(b._id), b);
      }
    }

    const allBookings = Array.from(bookingMap.values());
    allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: allBookings.length,
      bookings: allBookings,
      radius,
      message: 'Vendor bookings fetched successfully.',
    });
  } catch (err) {
    console.error('Error while fetching vendor bookings: ', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor bookings',
      error: err.message,
    });
  }
};
exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const vendorId = req.user.id;

    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        bookingStatus: 'Pending',
      },
      {
        $set: {
          vendor: vendorId,
          bookingStatus: 'Accepted',
          acceptedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'Booking is no longer available.',
      });
    }

    // updated part

    await ServiceExecution.create({
      booking: booking._id,
      vendor: vendorId,
      status: 'Route Pending',
    });

    const updated = await Booking.findById(bookingId)
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber');

    // Real-time: update customer & admin, and remove from other vendors' pools
    emitBookingStatusUpdated(updated);
    emitBookingTaken(bookingId, vendorId);

    return res.status(200).json({
      success: true,
      message: 'Booking accepted successfully.',
      booking: updated,
    });
  } catch (error) {
    console.error('Accept Booking Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept booking.',
      error: error.message,
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const vendorId = req.user.id;
    const { status, serviceCharge, paymentMethod, paymentStatus } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      vendor: vendorId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you.',
      });
    }

    const allowedStatuses = ['In Progress', 'Completed', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: ${status}`,
      });
    }

    if (status) {
      booking.bookingStatus = status;
    }

    if (status === 'Completed') {
      booking.completedAt = new Date();
      booking.paymentStatus = paymentStatus || 'Paid';
    }

    if (serviceCharge !== undefined && serviceCharge !== null) {
      booking.serviceCharge = Number(serviceCharge);
    }
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    const updated = await Booking.findById(bookingId)
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber');

    // Real-time: inform customer, vendor, and admin
    emitBookingStatusUpdated(updated);

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${booking.bookingStatus}.`,
      booking: updated,
    });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update booking status.',
      error: error.message,
    });
  }
};

exports.routeVerification = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const vendorId = req.user.id;
    const { distanceKm, ratePerKm } = req.body;

    if (distanceKm === undefined || distanceKm === '') {
      return res.status(400).json({
        success: false,
        message: 'Distance is required for route verification.',
      });
    }

    if (ratePerKm === undefined || ratePerKm === '') {
      return res
        .status(400)
        .json({ success: false, message: 'Rate per kilometer is required.' });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Route screenshot is required.',
      });
    }

    const execution = await ServiceExecution.findOne({
      booking: bookingId,
      vendor: vendorId,
      status: 'Route Pending',
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Service execution not found.',
      });
    }

    const distanceNum = Number(distanceKm);
    const rateNum = Number(ratePerKm);

    if (!Number.isFinite(distanceNum) || distanceNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Distance must be a valid  number.',
      });
    }
    if (!Number.isFinite(rateNum) || rateNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Rate per kilometer must be a valid number.',
      });
    }

    let screenshot = {
      url: null,
      fileId: null,
    };

    if (req.file) {
      try {
        const result = await uploadImageToImageKit(
          req.file.buffer,
          req.file.originalname || `route-${Date.now()}.jpg`,
        );

        screenshot.url = result.url;
        screenshot.fileId = result.fileId;
      } catch (error) {
        console.error('Route screenshot upload failed:', error);

        return res.status(500).json({
          success: false,
          message: 'Failed to upload route screenshot.',
        });
      }
    }

    // calculating travel charge
    const travelCharge = distanceNum * rateNum;

    //saving the ddata to the database
    execution.route.screenshot = screenshot;

    execution.route.distanceKm = distanceNum;
    execution.route.ratePerKm = rateNum;
    execution.route.travelCharge = travelCharge;

    execution.route.verified = true;
    execution.route.verifiedAt = new Date();

    execution.status = 'Route Verified';

    await execution.save();

    return res.status(200).json({
      success: true,
      message: 'Route verified successfully.',
      serviceExecution: execution,
    });
  } catch (error) {
    console.error('Submit Route Verification Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit route verification.',
      error: error.message,
    });
  }
};

exports.submitServiceDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const vendorId = req.user.id;

    const { checklist, customerNote } = req.body;

    const execution = await ServiceExecution.findOne({
      booking: bookingId,
      vendor: vendorId,
      status: 'Route Verified',
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        message:
          'Service execution not found or route verification is not completed.',
      });
    }

    let parsedChecklist;

    try {
      parsedChecklist =
        typeof checklist === 'string' ? JSON.parse(checklist) : checklist;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid checklist format.',
      });
    }

    if (!parsedChecklist || typeof parsedChecklist !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Checklist is required.',
      });
    }

    const checklistFields = [
      'service',
      'inspection',
      'diagnosis',
      'testingCleanup',
    ];

    for (const field of checklistFields) {
      if (typeof parsedChecklist[field] !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: `${field} must be true or false.`,
        });
      }
    }

    execution.checklist = {
      service: parsedChecklist.service,
      inspection: parsedChecklist.inspection,
      diagnosis: parsedChecklist.diagnosis,
      testingCleanup: parsedChecklist.testingCleanup,
    };

    execution.customerNote = customerNote || '';

    const beforeImage = req.files?.beforeImage?.[0];

    if (beforeImage) {
      const beforeUpload = await uploadImageToImageKit(
        beforeImage.buffer,
        beforeImage.originalname || `before-${Date.now()}.jpg`,
      );

      execution.documentation.beforeImage = {
        url: beforeUpload.url,
        fileId: beforeUpload.fileId,
      };
    }

    const afterImage = req.files?.afterImage?.[0];

    if (afterImage) {
      const afterUpload = await uploadImageToImageKit(
        afterImage.buffer,
        afterImage.originalname || `after-${Date.now()}.jpg`,
      );

      execution.documentation.afterImage = {
        url: afterUpload.url,
        fileId: afterUpload.fileId,
      };
    }

    // Route Verified -> In Progress
    execution.status = 'In Progress';

    await execution.save();

    return res.status(200).json({
      success: true,
      message: 'Service details submitted successfully.',
      serviceExecution: execution,
    });
  } catch (error) {
    console.error('Submit Service Details Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit service details.',
      error: error.message,
    });
  }
};

exports.completeService = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const vendorId = req.user.id;

    const { paymentMethod, discount = 0 } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required.',
      });
    }

    if (!['Cash', 'UPI'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Payment method must be Cash or UPI.',
      });
    }

    const discountAmount = Number(discount);

    if (!Number.isFinite(discountAmount) || discountAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount must be a valid positive number.',
      });
    }

    const execution = await ServiceExecution.findOne({
      booking: bookingId,
      vendor: vendorId,
      status: 'In Progress',
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Service execution not found or service is not in progress.',
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      vendor: vendorId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    await booking.populate('customer', 'fullName phoneNumber');

    if (!booking.customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer associated with this booking was not found.',
      });
    }

    const existingInvoice = await Invoice.findOne({
      booking: bookingId,
    });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice has already been generated for this booking.',
        invoice: existingInvoice,
      });
    }

    const serviceCharge = Number(booking.serviceCategoryCharge || 0);

    if (!Number.isFinite(serviceCharge) || serviceCharge < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service charge.',
      });
    }

    let travelCharge = 0;

    if (execution.route?.addToInvoice) {
      travelCharge = Number(execution.route?.travelCharge || 0);
    }

    if (!Number.isFinite(travelCharge) || travelCharge < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel charge.',
      });
    }

    //  Prepare invoice items

    const items = [];

    // Service item
    items.push({
      type: 'Service',
      name: booking.serviceCategory,
      quantity: 1,
      unitPrice: serviceCharge,
      amount: serviceCharge,
    });

    // Travel item
    if (travelCharge > 0) {
      items.push({
        type: 'Travel',
        name: 'Travel Charge',
        quantity: 1,
        unitPrice: travelCharge,
        amount: travelCharge,
      });
    }

    //  INVENTORY / COMPONENTS -- when inventory is created then here i have to add invenntory item code

    // 10. Calculate subtotal

    const subtotal = items.reduce((total, item) => total + item.amount, 0);

    //  TAX --- when admin fix the tax , than i have to write tax calculation code

    // Temporary tax until PricingConfig is created
    const tax = 0;

    //Validate Discount
    if (discountAmount > subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Discount cannot be greater than the subtotal.',
      });
    }

    //  Calculate total

    const totalAmount = subtotal - discountAmount + tax;

    // Generate invoice number

    const invoiceNumber = `MM-${Date.now()}`;

    const address = booking.address || {};

    const customerAddress = [
      address.addressLine1,
      address.street,
      address.city,
      address.state,
      address.pincode,
      address.landmark,
    ]
      .filter(Boolean)
      .join(', ');

    // Create invoice

    const invoice = await Invoice.create({
      booking: booking._id,

      customer: booking.customer._id,

      vendor: vendorId,

      serviceExecution: execution._id,

      invoiceNumber,

 

      customerSnapshot: {
        name: booking.customer.fullName,
        phone: booking.customer.phoneNumber || '',
        address: customerAddress,
      },

      

      serviceSnapshot: {
        appliance: booking.appliance,
        serviceCategory: booking.serviceCategory || '',
        serviceDate: booking.serviceDate,
      },

      

      items,

      
      // Amounts
      

      subtotal,

      discount: discountAmount,

      tax,

      totalAmount,

      // Payment
      

      paymentMethod,

      paymentStatus: 'Paid',

      paidAt: new Date(),

    

      customerNote: execution.customerNote || '',
    });

    execution.status = 'Completed';

    await execution.save();

    booking.bookingStatus = 'Completed';

    booking.completedAt = new Date();

    booking.paymentStatus = 'Paid';

    booking.paymentMethod = paymentMethod;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Service completed and invoice generated successfully.',

      invoice,

      serviceExecution: execution,

      booking,
    });
  } catch (error) {
    console.error('Complete Service Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to complete service and generate invoice.',
      error: error.message,
    });
  }
};
