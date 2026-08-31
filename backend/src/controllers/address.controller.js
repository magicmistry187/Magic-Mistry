const mongoose = require('mongoose');
const Address = require('../models/address.model');
const User = require('../models/user.model');

exports.createAddress = async (req, res) => {
  try {
    const {
      addressType,
      house,
      flat,
      street,
      landmark,
      city,
      state,
      country,
      pincode,
      location,
      latitude,
      longitude,
      lat,
      lng,
      isDefault,
    } = req.body;

    const houseVal = (house || flat || street || 'Home').trim();
    const streetVal = (street || houseVal || 'Area').trim();
    const cityVal = (city || 'Kolkata').trim();
    const stateVal = (state || 'West Bengal').trim();
    const pincodeVal = (pincode || '000000').trim();


    //Here we add geocode api to get longitude and latitude

    // Parse coordinates
    // let coords = [88.3639, 22.5726]; // default Kolkata lng, lat

let coords = [19.449832 , 72.883995] // default location for checking functionality
    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      coords = [Number(location.coordinates[0]), Number(location.coordinates[1])];
    } else if (longitude !== undefined && latitude !== undefined) {
      coords = [Number(longitude), Number(latitude)];
    } else if (lng !== undefined && lat !== undefined) {
      coords = [Number(lng), Number(lat)];
    }

    const geoPoint = {
      type: 'Point',
      coordinates: coords,
    };

    const addressCount = await Address.countDocuments({
      user: req.user.id

    });

    const makeDefault = addressCount === 0 ? true : !!isDefault;

    if (makeDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } },
      );
    }

    const address = await Address.create({
      user: req.user.id,
      addressType: addressType || "Home",
      house: houseVal,
      addressLine1: houseVal,
      street: streetVal,
      landmark: (landmark || "").trim(),
      city: cityVal,
      state: stateVal,
      country: (country || "India").trim(),
      pincode: pincodeVal,
      location: geoPoint,
      isDefault: makeDefault,
    });

    // If marked default, also sync user's active location on User model
    if (makeDefault) {
      const formattedLoc = [houseVal, streetVal, cityVal].filter(Boolean).join(', ');
      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          location: formattedLoc,
          latitude: coords[1],
          longitude: coords[0],
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      data: address,
      address: address,
    });
  } catch (error) {
    console.error('Create Address Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create address: ' + (error.message || error),
    });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.id,
    }).sort({ isDefault: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Addresses fetched successfully.',
      data: addresses,
      addresses: addresses,
      count: addresses.length,
    });
  } catch (error) {
    console.error('Get Addresses Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({
      _id: id,
      user: req.user.id,
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Address fetched successfully.',
      data: address,
      address: address,
    });
  } catch (error) {
    console.error('Get Address Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    console.log("update addrss called")
    const { id } = req.params;

    const existingAddress = await Address.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    const updatePayload = { ...req.body };
    if (req.body.flat && !req.body.house) {
      updatePayload.house = req.body.flat;
      updatePayload.addressLine1 = req.body.flat;
    } else if (req.body.house) {
      updatePayload.addressLine1 = req.body.house;
    }

    if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
      updatePayload.location = {
        type: 'Point',
        coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
      };
    } else if (req.body.lng !== undefined && req.body.lat !== undefined) {
      updatePayload.location = {
        type: 'Point',
        coordinates: [Number(req.body.lng), Number(req.body.lat)],
      };
    }

    if (req.body.isDefault) {
      await Address.updateMany(
        {
          user: req.user.id,
          _id: { $ne: id },
        },
        {
          $set: { isDefault: false },
        },
      );
    }
    const updatedAddress = await Address.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id,
      },
      {
        $set: updatePayload,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (updatedAddress && (updatedAddress.isDefault || req.body.isDefault)) {
      const formattedLoc = [
        updatedAddress.house || updatedAddress.addressLine1,
        updatedAddress.street,
        updatedAddress.city,
      ]
        .filter(Boolean)
        .join(", ");
      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          location: formattedLoc,
          latitude: updatedAddress.location?.coordinates?.[1] || null,
          longitude: updatedAddress.location?.coordinates?.[0] || null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      data: updatedAddress,
      address: updatedAddress,
    });
  } catch (error) {
    console.error('Update Address Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const id = req.params?.id || req.query?.id || req.body?.id || req.body?.addressId;
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required.',
      });
    }

    // 1. Try finding the specific address if valid ObjectId
    let address = null;
    if (id && id !== 'undefined' && id !== 'null' && !String(id).startsWith('default-') && mongoose.Types.ObjectId.isValid(id)) {
      address = await Address.findOne({
        _id: id,
        user: userId,
      });
      if (!address) {
        address = await Address.findById(id);
        if (address && String(address.user) !== String(userId)) {
          address = null; // Belongs to another user
        }
      }
    }

    // 2. If specific address found, delete it; otherwise delete for this user
    if (address) {
      await Address.findByIdAndDelete(address._id);
    } else {
      await Address.deleteMany({ user: userId });
    }

    // 3. Check if any remaining addresses exist for this user
    const remainingAddress = await Address.findOne({ user: userId }).sort({ isDefault: -1, createdAt: -1 });

    if (remainingAddress) {
      remainingAddress.isDefault = true;
      await remainingAddress.save();
      const formattedLoc = [
        remainingAddress.house || remainingAddress.addressLine1,
        remainingAddress.street,
        remainingAddress.city,
      ]
        .filter(Boolean)
        .join(', ');
      await User.findByIdAndUpdate(userId, {
        $set: {
          location: formattedLoc,
          latitude: remainingAddress.location?.coordinates?.[1] || null,
          longitude: remainingAddress.location?.coordinates?.[0] || null,
        },
      });
    } else {
      // Completely clean up: no addresses left in DB
      await Address.deleteMany({ user: userId });
      await User.findByIdAndUpdate(userId, {
        $set: { location: '', latitude: null, longitude: null },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Address Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + (error.message || error),
    });
  }
};
