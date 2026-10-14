
const Payout = require('../models/payout.model');
const VendorEarning = require('../models/vendorEarning.model');


exports.createPayoutRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const vendorId = req.user.id;

    console.log('Vendor ID:', vendorId);

    const { earnings, amount, daysOfWork, settlementNotes = '' } = req.body;

    // Validate earning IDs.
    if (!Array.isArray(earnings) || earnings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one earning ID.',
      });
    }

    const earningIds = [...new Set(earnings.map(String))];

    if (
      earningIds.length !== earnings.length ||
      earningIds.some((id) => !mongoose.isValidObjectId(id))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Earning IDs are invalid or duplicated.',
      });
    }

    // Validate payout amount.
    const payoutAmount = Number(amount);

    if (!Number.isFinite(payoutAmount) || payoutAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payout amount.',
      });
    }

    // Validate working days.
    const workDays = Number(daysOfWork);

    if (!Number.isInteger(workDays) || workDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Days of work must be a positive whole number.',
      });
    }

    // Validate optional settlement notes.
    if (typeof settlementNotes !== 'string' || settlementNotes.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Settlement notes must not exceed 500 characters.',
      });
    }

    let createdPayout;

    // Create payout and update earnings in one transaction.
    await session.withTransaction(async () => {
      // Find earnings belonging to the logged-in vendor.
      const earningRecords = await VendorEarning.find({
        _id: { $in: earningIds },
        vendor: vendorId,
        status: 'Available',
      }).session(session);

      // Ensure every earning belongs to this vendor
      // and is available for payout.
      if (earningRecords.length !== earningIds.length) {
        const error = new Error(
          'Some earning records were not found, do not belong to you, or are not Available.',
        );

        error.statusCode = 400;
        throw error;
      }

      // Calculate service earnings.
      const serviceEarningAmount = Number(
        earningRecords
          .reduce(
            (total, earning) => total + Number(earning.serviceShareAmount || 0),
            0,
          )
          .toFixed(2),
      );

      // Calculate travel earnings.
      const travelEarningAmount = Number(
        earningRecords
          .reduce(
            (total, earning) => total + Number(earning.travelCharge || 0),
            0,
          )
          .toFixed(2),
      );

      // Calculate the total payout amount.
      const calculatedAmount = Number(
        (serviceEarningAmount + travelEarningAmount).toFixed(2),
      );

      // Verify the amount submitted by the frontend.
      if (Math.abs(payoutAmount - calculatedAmount) > 0.01) {
        const error = new Error(
          `Amount mismatch. Expected amount: ${calculatedAmount}`,
        );

        error.statusCode = 400;
        throw error;
      }

      // Create the payout request for the admin dashboard.
      const [payout] = await Payout.create(
        [
          {
            vendor: vendorId,
            earnings: earningRecords.map((earning) => earning._id),
            serviceEarningAmount,
            travelEarningAmount,
            daysOfWork: workDays,
            amount: calculatedAmount,
            settlementNotes: settlementNotes.trim(),
            status: 'Requested',
          },
        ],
        { session },
      );

      // Mark the selected earnings as included in this payout.
      const updateResult = await VendorEarning.updateMany(
        {
          _id: { $in: earningIds },
          vendor: vendorId,
          status: 'Available',
        },
        {
          $set: {
            status: 'Included In Payout',
            payout: payout._id,
          },
        },
        { session },
      );

      // Ensure every selected earning was updated.
      if (updateResult.modifiedCount !== earningIds.length) {
        const error = new Error(
          'Failed to update all selected earning records.',
        );

        error.statusCode = 409;
        throw error;
      }

      createdPayout = payout;
    });

    return res.status(201).json({
      success: true,
      message: 'Payout request created successfully.',
      data: createdPayout,
    });
  } catch (error) {
    console.error('Create payout request error:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Failed to create payout request.',
    });
  } finally {
    await session.endSession();
  }
};
