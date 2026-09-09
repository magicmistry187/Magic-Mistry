const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const Address = require('../models/address.model');

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

    // Parse coordinates if provided
    let coords = null;
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      latitude !== null &&
      longitude !== null &&
      !isNaN(Number(latitude)) &&
      !isNaN(Number(longitude))
    ) {
      coords = [Number(longitude), Number(latitude)];
    }

    // Delegate location management to Address collection
    let userAddress = await Address.findOne({ user: user._id, isDefault: true });
    if (!userAddress) {
      userAddress = await Address.findOne({ user: user._id }).sort({ createdAt: -1 });
    }

    if (userAddress) {
      if (!isClearing && cleanLocation) {
        userAddress.addressLine1 = cleanLocation;
        if (!userAddress.street) userAddress.street = cleanLocation;
      }
      if (coords) {
        userAddress.location = { type: 'Point', coordinates: coords };
      } else if (isClearing) {
        userAddress.location = undefined;
      }
      userAddress.isDefault = true;
      await userAddress.save();
    } else if (!isClearing && (cleanLocation || coords)) {
      const addressData = {
        user: user._id,
        addressType: 'Home',
        addressLine1: cleanLocation || 'Current Location',
        street: cleanLocation || 'Current Location',
        city: 'Current Location',
        state: 'West Bengal',
        country: 'India',
        pincode: '000000',
        isDefault: true,
      };
      if (coords) {
        addressData.location = { type: 'Point', coordinates: coords };
      }
      userAddress = await Address.create(addressData);
    }

    const activeLocationStr = userAddress
      ? [userAddress.house || userAddress.flat || userAddress.addressLine1, userAddress.street, userAddress.city].filter(Boolean).join(', ')
      : '';

    return res.status(200).json({
      success: true,
      message: 'User location updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: isClearing ? '' : (cleanLocation || activeLocationStr),
        latitude: isClearing ? null : (coords ? coords[1] : (userAddress?.location?.coordinates?.[1] ?? null)),
        longitude: isClearing ? null : (coords ? coords[0] : (userAddress?.location?.coordinates?.[0] ?? null)),
      },
      address: userAddress || null,
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

    // Retrieve active address from Address model
    const defaultAddress = await Address.findOne({ user: user._id }).sort({ isDefault: -1, createdAt: -1 });

    const displayLocation = defaultAddress
      ? [defaultAddress.house || defaultAddress.flat || defaultAddress.addressLine1, defaultAddress.street, defaultAddress.city]
          .filter(Boolean)
          .join(', ')
      : '';

    const lat = defaultAddress?.location?.coordinates?.[1] ?? null;
    const lng = defaultAddress?.location?.coordinates?.[0] ?? null;

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: displayLocation,
        latitude: lat,
        longitude: lng,
      },
      address: defaultAddress || null,
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

    // If location or coordinates were passed, update the Address record
    let userAddress = null;
    if (location !== undefined || (latitude !== undefined && longitude !== undefined)) {
      userAddress = await Address.findOne({ user: user._id, isDefault: true });
      if (!userAddress) {
        userAddress = await Address.findOne({ user: user._id }).sort({ createdAt: -1 });
      }

      let coords = null;
      if (
        latitude !== undefined &&
        longitude !== undefined &&
        latitude !== null &&
        longitude !== null &&
        !isNaN(Number(latitude)) &&
        !isNaN(Number(longitude))
      ) {
        coords = [Number(longitude), Number(latitude)];
      }

      const cleanLoc = location !== undefined ? String(location).trim() : '';

      if (userAddress) {
        if (cleanLoc) {
          userAddress.addressLine1 = cleanLoc;
          if (!userAddress.street) userAddress.street = cleanLoc;
        }
        if (coords) {
          userAddress.location = { type: 'Point', coordinates: coords };
        }
        await userAddress.save();
      } else if (cleanLoc || coords) {
        userAddress = await Address.create({
          user: user._id,
          addressType: 'Home',
          addressLine1: cleanLoc || 'Current Location',
          street: cleanLoc || 'Current Location',
          city: 'Current Location',
          state: 'West Bengal',
          country: 'India',
          pincode: '000000',
          location: coords ? { type: 'Point', coordinates: coords } : undefined,
          isDefault: true,
        });
      }
    } else {
      userAddress = await Address.findOne({ user: user._id }).sort({ isDefault: -1, createdAt: -1 });
    }

    const activeLocStr = userAddress
      ? [userAddress.house || userAddress.flat || userAddress.addressLine1, userAddress.street, userAddress.city].filter(Boolean).join(', ')
      : '';

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
        location: activeLocStr,
        latitude: userAddress?.location?.coordinates?.[1] ?? null,
        longitude: userAddress?.location?.coordinates?.[0] ?? null,
      },
      address: userAddress || null,
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
