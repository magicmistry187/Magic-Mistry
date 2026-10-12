

const Payout = require('../models/payout.model');
const VendorEarning = require('../models/vendorEarning.model');

// Vendor creates a payout request using their available earnings.
const createPayoutRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const vendorId = req.user.id;
    const { earnings, payoutMethod } = req.body;

    // Validate the selected earnings.
    if (!Array.isArray(earnings) || earnings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one earning.',
      });
    }

    // Validate the payout method.
    if (!['UPI', 'Bank Transfer'].includes(payoutMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Payout method must be UPI or Bank Transfer.',
      });
    }

    // Prevent duplicate earning IDs in the request.
    const uniqueEarnings = [...new Set(earnings)];

    if (uniqueEarnings.length !== earnings.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate earnings are not allowed.',
      });
    }

    // Validate MongoDB IDs.
    const invalidIds = uniqueEarnings.some(
      (id) => !mongoose.isValidObjectId(id)
    );

    if (invalidIds) {
      return res.status(400).json({
        success: false,
        message: 'One or more earning IDs are invalid.',
      });
    }

    let createdPayout;

    // Keep payout creation and earning updates consistent.
    await session.withTransaction(async () => {
      // Only select this vendor's earnings that are still available.
      const selectedEarnings = await VendorEarning.find({
        _id: { $in: uniqueEarnings },
        vendor: vendorId,
        status: 'Available',
      }).session(session);

      // Reject if an earning is missing, unavailable, or belongs to another vendor.
      if (selectedEarnings.length !== uniqueEarnings.length) {
        const error = new Error(
          'Some earnings are unavailable or do not belong to you.'
        );
        error.statusCode = 400;
        throw error;
      }

      // Calculate amounts on the backend.
      const serviceEarningAmount = selectedEarnings.reduce(
        (total, earning) => total + earning.serviceShareAmount,
        0
      );

      const travelEarningAmount = selectedEarnings.reduce(
        (total, earning) => total + earning.travelCharge,
        0
      );

      const amount = serviceEarningAmount + travelEarningAmount;

      if (amount <= 0) {
        const error = new Error(
          'The total payout amount must be greater than zero.'
        );
        error.statusCode = 400;
        throw error;
      }

      // Create the payout request for the admin to review.
      const [payout] = await Payout.create(
        [
          {
            vendor: vendorId,
            earnings: selectedEarnings.map((earning) => earning._id),
            serviceEarningAmount,
            travelEarningAmount,
            amount,
            payoutMethod,
            status: 'Requested',
            requestedAt: new Date(),
          },
        ],
        { session }
      );

      // Reserve the selected earnings so they cannot be requested twice.
      const updateResult = await VendorEarning.updateMany(
        {
          _id: { $in: uniqueEarnings },
          vendor: vendorId,
          status: 'Available',
        },
        {
          $set: {
            status: 'Included In Payout',
            payout: payout._id,
          },
        },
        { session }
      );

      if (updateResult.modifiedCount !== uniqueEarnings.length) {
        throw new Error(
          'Could not reserve all selected earnings. Please try again.'
        );
      }

      createdPayout = payout;
    });

    return res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully.',
      data: createdPayout,
    });
  } catch (error) {
    console.error('Create payout request error:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 400
          ? error.message
          : 'Failed to create payout request.',
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createPayoutRequest,
};

