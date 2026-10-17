
const mongoose = require('mongoose');

const FuelClaim = require('../models/fuelClaim.model');
const Booking = require('../models/booking.model');


const { uploadImageToImageKit } = require("../config/imagekit");


exports.createFuelClaim = async (req, res) => {
  try {
    const vendorId = req.user?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const {
      booking,
      claimAmount,
      vehicleType,
      distanceKm,
      reason,
    } = req.body;

    
    if (
      !booking ||
      claimAmount === undefined ||
      claimAmount === '' ||
      !vehicleType ||
      distanceKm === undefined ||
      distanceKm === '' ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Booking, claim amount, vehicle type, distance, and reason are required.',
      });
    }

    if (!mongoose.isValidObjectId(booking)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID.',
      });
    }

    const amount = Number(claimAmount);
    const distance = Number(distanceKm);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Claim amount must be greater than zero.',
      });
    }

    if (!Number.isFinite(distance) || distance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Distance must be greater than zero.',
      });
    }

    const validVehicleTypes = [
      'Company',
      '2-Wheeler',
      '3-Wheeler',
      '4-Wheeler',
    ];

    if (!validVehicleTypes.includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle type.',
      });
    }

  
    const files = req.files || {};

    const proofFiles = {
      petrolReceipt: files.petrolReceipt?.[0],
      mapProof: files.mapProof?.[0],
      odometer: files.odometer?.[0],
    };

    // At least one proof is mandatory.
    if (!Object.values(proofFiles).some(Boolean)) {
      return res.status(400).json({
        success: false,
        message:
          'Upload at least one proof: petrol receipt, map proof, or odometer photo.',
      });
    }

    const bookingData = await Booking.findById(booking).select('vendor');

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    .
    const bookingVendorId =
      bookingData.vendor?._id || bookingData.vendor;

    if (
      !bookingVendorId ||
      bookingVendorId.toString() !== vendorId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to claim fuel expenses for this booking.',
      });
    }

   
    const proofs = {
      petrolReceipt: { url: '', fileId: '' },
      mapProof: { url: '', fileId: '' },
      odometer: { url: '', fileId: '' },
    };

   Upload only the files the vendor provided.
    for (const [proofType, file] of Object.entries(proofFiles)) {
      if (!file) continue;

      const result = await uploadImageToImageKit(
        file.buffer,
        file.originalname ||
          `fuel-claim-${proofType}-${Date.now()}.jpg`
      );

      if (!result?.url) {
        throw new Error(`ImageKit upload failed for ${proofType}.`);
      }

      proofs[proofType] = {
        url: result.url,
        fileId: result.fileId || '',
      };
    }

  

    const fuelClaim = await FuelClaim.create({
      vendor: vendorId,
      booking,
      claimAmount: amount,
      vehicleType,
      distanceKm: distance,
      reason: reason.trim(),
      proofs,
      status: 'Pending',
    });

  
    return res.status(201).json({
      success: true,
      message: 'Fuel claim submitted successfully.',
      data: fuelClaim,
    });
  } catch (error) {
    console.error('Create fuel claim error:', error);

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit fuel claim.',
    });
  }
};
