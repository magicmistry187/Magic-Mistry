const VendorEarning = require('../models/vendorEarning.model');

// Get all earnings of the  vendor
exports.getVendorEarnings = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const earnings = await VendorEarning.find({
      vendor: vendorId,
    })
      .populate('booking', 'appliance serviceCategory serviceDate bookingStatus')
      .populate('invoice', 'invoiceNumber totalAmount paymentStatus')
      .sort({ earnedAt: -1 });

    return res.status(200).json({
      success: true,
      count: earnings.length,
      earnings,
    });
  } catch (error) {
    console.error('Get Vendor Earnings Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor earnings.',
      error: error.message,
    });
  }
};

// Get one specific earning for vendor
exports.getVendorEarningById = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;

    const earning = await VendorEarning.findOne({
      _id: id,
      vendor: vendorId,
    })
      .populate('booking')
      .populate('invoice')
      .populate('vendor', 'fullName email phoneNumber');

    if (!earning) {
      return res.status(404).json({
        success: false,
        message: 'Vendor earning not found.',
      });
    }

    return res.status(200).json({
      success: true,
      earning,
    });
  } catch (error) {
    console.error('Get Vendor Earning Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor earning.',
      error: error.message,
    });
  }
};

// Get all vendor earnings for the admin
exports.getAllVendorEarnings = async (req, res) => {
  try {
    const earnings = await VendorEarning.find()
      .populate('vendor', 'fullName email phoneNumber vendorId')
      .populate(
        'booking',
        'appliance serviceCategory serviceDate bookingStatus'
      )
      .populate('invoice', 'invoiceNumber totalAmount paymentStatus')
      .sort({ earnedAt: -1 });

    return res.status(200).json({
      success: true,
      count: earnings.length,
      earnings,
    });
  } catch (error) {
    console.error('Get All Vendor Earnings Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor earnings.',
      error: error.message,
    });
  }
};

// Get all earnings of a specific vendor for the admin
exports.getAllVendorEarningsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const earnings = await VendorEarning.find({
      vendor: vendorId,
    })
      .populate('vendor', 'fullName email phoneNumber vendorId')
      .populate(
        'booking',
        'appliance serviceCategory serviceDate bookingStatus'
      )
      .populate('invoice', 'invoiceNumber totalAmount paymentStatus')
      .sort({ earnedAt: -1 });

    return res.status(200).json({
      success: true,
      count: earnings.length,
      earnings,
    });
  } catch (error) {
    console.error('Get Vendor Earnings By Vendor Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor earnings.',
      error: error.message,
    });
  }
};