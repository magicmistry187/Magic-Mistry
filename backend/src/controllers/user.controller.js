const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const Address = require('../models/address.model');
const { parseAddressString, formatCleanAddress } = require('../utils/addressParser');

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

    const rawCleanLocation = location !== undefined ? String(location).trim() : '';
    const cleanLocation = formatCleanAddress(rawCleanLocation);
    const isClearing = !cleanLocation || cleanLocation === 'Set Your Location';

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

    const parsed = parseAddressString(cleanLocation);

    // Delegate location management to Address collection
    let userAddress = await Address.findOne({ user: user._id, isDefault: true });
    if (!userAddress) {
      userAddress = await Address.findOne({ user: user._id }).sort({ createdAt: -1 });
    }

    if (userAddress) {
      if (!isClearing && cleanLocation) {
        userAddress.addressLine1 = cleanLocation;
        if (parsed.street) {
          userAddress.street = parsed.street;
        } else if (!userAddress.street || userAddress.street === 'Current Location' || userAddress.street === 'Area') {
          userAddress.street = cleanLocation;
        }
        if (parsed.city) {
          userAddress.city = parsed.city;
        } else if (!userAddress.city || userAddress.city === 'Current Location') {
          userAddress.city = 'Local Area';
        }
        if (parsed.state) {
          userAddress.state = parsed.state;
        }
        if (parsed.pincode) {
          userAddress.pincode = parsed.pincode;
        } else if (userAddress.pincode === '000000') {
          userAddress.pincode = '';
        }
        if (parsed.flat) {
          userAddress.house = parsed.flat;
        } else if (userAddress.house && (userAddress.house.includes(',') || userAddress.house.length > 25)) {
          userAddress.house = '';
        }
        if (parsed.landmark) {
          userAddress.landmark = parsed.landmark;
        }
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
        house: parsed.flat || '',
        addressLine1: cleanLocation,
        street: parsed.street || cleanLocation || 'Local Area',
        landmark: parsed.landmark || '',
        city: parsed.city || 'Local Area',
        state: parsed.state || '',
        country: 'India',
        pincode: (parsed.pincode === '000000' ? '' : (parsed.pincode || '')),
        isDefault: true,
      };
      if (coords) {
        addressData.location = { type: 'Point', coordinates: coords };
      }
      userAddress = await Address.create(addressData);
    }

    if (user.role === 'vendor' && !isClearing && cleanLocation) {
      const VendorProfile = require('../models/vendorProfile.model');
      await VendorProfile.findOneAndUpdate(
        { user: user._id },
        { serviceAddress: cleanLocation }
      );
    }

    const activeLocationStr = userAddress
      ? formatCleanAddress(userAddress)
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
        vendorId: user.vendorId || undefined,
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

    const isSuperAdmin = user.email && user.email.toLowerCase().trim() === 'magicmistry187@gmail.com';
    if (isSuperAdmin && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: isSuperAdmin ? 'admin' : user.role,
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

      const rawCleanLoc = location !== undefined ? String(location).trim() : '';
      const cleanLoc = formatCleanAddress(rawCleanLoc);
      const parsedLoc = cleanLoc ? parseAddressString(cleanLoc) : null;

      if (userAddress) {
        if (cleanLoc && parsedLoc) {
          userAddress.addressLine1 = cleanLoc;
          if (parsedLoc.street) userAddress.street = parsedLoc.street;
          if (parsedLoc.city) userAddress.city = parsedLoc.city;
          if (parsedLoc.state) userAddress.state = parsedLoc.state;
          if (parsedLoc.pincode) userAddress.pincode = parsedLoc.pincode;
          if (parsedLoc.flat) userAddress.house = parsedLoc.flat;
          if (parsedLoc.landmark) userAddress.landmark = parsedLoc.landmark;
        }
        if (coords) {
          userAddress.location = { type: 'Point', coordinates: coords };
        }
        await userAddress.save();
      } else if (cleanLoc || coords) {
        userAddress = await Address.create({
          user: user._id,
          addressType: 'Home',
          house: parsedLoc?.flat || '',
          addressLine1: cleanLoc || 'Local Area',
          street: parsedLoc?.street || cleanLoc || 'Local Area',
          city: parsedLoc?.city || 'Local Area',
          state: parsedLoc?.state || '',
          country: 'India',
          pincode: (parsedLoc?.pincode === '000000' ? '' : (parsedLoc?.pincode || '')),
          landmark: parsedLoc?.landmark || '',
          location: coords ? { type: 'Point', coordinates: coords } : undefined,
          isDefault: true,
        });
      }
    } else {
      userAddress = await Address.findOne({ user: user._id }).sort({ isDefault: -1, createdAt: -1 });
    }

    if (updatedUser.role === 'vendor' && cleanLoc) {
      const VendorProfile = require('../models/vendorProfile.model');
      await VendorProfile.findOneAndUpdate(
        { user: updatedUser._id },
        { serviceAddress: cleanLoc }
      );
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
        vendorId: updatedUser.vendorId || undefined,
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
