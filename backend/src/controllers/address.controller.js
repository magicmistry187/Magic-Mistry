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

let coords = [72.883995, 19.449832]; // default location for checking functionality
//First one is longitude and 2nd one is latitude
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
    });

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
    const rawId = req.params.id || req.body._id || req.body.id || req.body.addressId || req.query.id;
    const cleanId = rawId && rawId !== 'undefined' && rawId !== 'null' ? rawId : null;

    if (!cleanId || !mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid address ID is required to update an address.',
      });
    }

    const existingAddress = await Address.findOne({
      _id: cleanId,
      user: req.user.id,
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    const updatePayload = { ...req.body };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.addressId;

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

    let updatedAddress;

    if (existingAddress) {
      if (req.body.isDefault) {
        await Address.updateMany(
          {
            user: req.user.id,
            _id: { $ne: existingAddress._id },
          },
          {
            $set: { isDefault: false },
          },
        );
      }

      updatedAddress = await Address.findByIdAndUpdate(
        existingAddress._id,
        {
          $set: updatePayload,
        },
        {
          new: true,
          runValidators: true,
        },
      );
    } else {
      // If no address exists yet for this user/vendor, create it
      const houseVal = (req.body.house || req.body.flat || req.body.street || 'Home').trim();
      const streetVal = (req.body.street || houseVal || 'Area').trim();
      const cityVal = (req.body.city || 'Kolkata').trim();
      const stateVal = (req.body.state || 'West Bengal').trim();
      const pincodeVal = (req.body.pincode || '000000').trim();

      let coords = [88.3639, 22.5726];
      if (req.body.location?.coordinates?.length === 2) {
        coords = [Number(req.body.location.coordinates[0]), Number(req.body.location.coordinates[1])];
      } else if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
        coords = [Number(req.body.longitude), Number(req.body.latitude)];
      }

      updatedAddress = await Address.create({
        user: req.user.id,
        addressType: req.body.addressType || req.body.type || 'Home',
        house: houseVal,
        addressLine1: houseVal,
        street: streetVal,
        landmark: (req.body.landmark || '').trim(),
        city: cityVal,
        state: stateVal,
        country: (req.body.country || 'India').trim(),
        pincode: pincodeVal,
        location: { type: 'Point', coordinates: coords },
        isDefault: true,
      });
    }

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
    const wasDefault = address.isDefault;

    await Address.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });
    if (wasDefault) {
      const anotherAddress = await Address.findOne({
        user: req.user.id,
      });

      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }
    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Address Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
