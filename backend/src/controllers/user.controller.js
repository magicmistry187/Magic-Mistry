const mongoose = require('mongoose');
const userModel = require('../models/user.model');

// Update User Active Location
async function updateUserLocation(req, res) {
  try {
    const { location, latitude, longitude } = req.body;
    const userId = req.user.id || req.user.userId || req.user._id;

    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await userModel.findById(userId);
    }
    if (!user && req.user?.email) {
      user = await userModel.findOne({
        email: req.user.email.toLowerCase().trim(),
      });
    }
    if (!user && req.user?.vendorId) {
      user = await userModel.findOne({ vendorId: req.user.vendorId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (location === undefined && latitude === undefined && longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Location or coordinates required',
      });
    }

    const cleanLocation = location !== undefined ? String(location).trim() : '';
    const isClearing = cleanLocation === '' || cleanLocation === 'Set Your Location';

    const updateFields = {};
    if (location !== undefined) {
      updateFields.location = isClearing ? '' : cleanLocation;
    }
    if (latitude !== undefined) {
      updateFields.latitude = isClearing || latitude === null ? null : Number(latitude);
    }
    if (longitude !== undefined) {
      updateFields.longitude = isClearing || longitude === null ? null : Number(longitude);
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User location updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        location: updatedUser.location,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
      },
    });
  } catch (error) {
    console.error('Update User Location Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location: ' + (error.message || error),
    });
  }
}

// Get Current User Profile
async function getUserProfile(req, res) {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await userModel.findById(userId);
    }
    if (!user && req.user?.email) {
      user = await userModel.findOne({
        email: req.user.email.toLowerCase().trim(),
      });
    }
    if (!user && req.user?.vendorId) {
      user = await userModel.findOne({ vendorId: req.user.vendorId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: user.location || '',
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
}

// Update User Profile
async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await userModel.findById(userId);
    }
    if (!user && req.user?.email) {
      user = await userModel.findOne({
        email: req.user.email.toLowerCase().trim(),
      });
    }
    if (!user && req.user?.vendorId) {
      user = await userModel.findOne({ vendorId: req.user.vendorId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { fullName, phoneNumber, location, latitude, longitude } = req.body;
    const updateFields = {};

    if (fullName) updateFields.fullName = fullName.trim();
    if (phoneNumber) updateFields.phoneNumber = phoneNumber.trim();
    if (location !== undefined) updateFields.location = String(location).trim();
    if (latitude !== undefined && latitude !== null)
      updateFields.latitude = Number(latitude);
    if (longitude !== undefined && longitude !== null)
      updateFields.longitude = Number(longitude);

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        location: updatedUser.location,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
      },
    });
  } catch (error) {
    console.error('Update User Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
}

module.exports = {
  updateUserLocation,
  getUserProfile,
  updateUserProfile,
};
