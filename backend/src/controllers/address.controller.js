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

    const houseVal = (house || flat || '').trim();
    const streetVal = (street || '').trim();
    const addressLine1Val = (req.body.addressLine1 || houseVal || streetVal).trim();
    const cityVal = (city || '').trim();
    const stateVal = (state || '').trim();
    const pincodeVal = (pincode || '').trim();
    const landmarkVal = (landmark || '').trim();
    const countryVal = (country || 'India').trim();

    // Validation
    if (!addressLine1Val && !streetVal) {
      return res.status(400).json({
        success: false,
        message: 'Street or address line is required.',
      });
    }

    if (!cityVal || !stateVal || !pincodeVal) {
      return res.status(400).json({
        success: false,
        message: 'City, state, and pincode are required.',
      });
    }

    // Parse coordinates if provided
    let coords = null;
    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2 && !isNaN(Number(location.coordinates[0])) && !isNaN(Number(location.coordinates[1]))) {
      coords = [Number(location.coordinates[0]), Number(location.coordinates[1])];
    } else if (longitude !== undefined && latitude !== undefined && !isNaN(Number(longitude)) && !isNaN(Number(latitude))) {
      coords = [Number(longitude), Number(latitude)];
    } else if (lng !== undefined && lat !== undefined && !isNaN(Number(lng)) && !isNaN(Number(lat))) {
      coords = [Number(lng), Number(lat)];
    }

    const addressCount = await Address.countDocuments({
      user: req.user.id,
    });

    const makeDefault = addressCount === 0 ? true : !!isDefault;

    if (makeDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } },
      );
    }

    const addressData = {
      user: req.user.id,
      addressType: addressType || 'Home',
      house: houseVal,
      addressLine1: addressLine1Val,
      street: streetVal || addressLine1Val,
      landmark: landmarkVal,
      city: cityVal,
      state: stateVal,
      country: countryVal,
      pincode: pincodeVal,
      isDefault: makeDefault,
    };

    if (coords) {
      addressData.location = {
        type: 'Point',
        coordinates: coords,
      };
    }

    const address = await Address.create(addressData);

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
      const houseVal = (req.body.house || req.body.flat || '').trim();
      const streetVal = (req.body.street || '').trim();
      const addressLine1Val = (req.body.addressLine1 || houseVal || streetVal).trim();
      const cityVal = (req.body.city || '').trim();
      const stateVal = (req.body.state || '').trim();
      const pincodeVal = (req.body.pincode || '').trim();

      if (!addressLine1Val && !streetVal) {
        return res.status(400).json({
          success: false,
          message: 'Street or address line is required.',
        });
      }
      if (!cityVal || !stateVal || !pincodeVal) {
        return res.status(400).json({
          success: false,
          message: 'City, state, and pincode are required.',
        });
      }

      let coords = null;
      if (req.body.location?.coordinates?.length === 2 && !isNaN(Number(req.body.location.coordinates[0])) && !isNaN(Number(req.body.location.coordinates[1]))) {
        coords = [Number(req.body.location.coordinates[0]), Number(req.body.location.coordinates[1])];
      } else if (req.body.longitude !== undefined && req.body.latitude !== undefined && !isNaN(Number(req.body.longitude)) && !isNaN(Number(req.body.latitude))) {
        coords = [Number(req.body.longitude), Number(req.body.latitude)];
      }

      const newAddrData = {
        user: req.user.id,
        addressType: req.body.addressType || req.body.type || 'Home',
        house: houseVal,
        addressLine1: addressLine1Val,
        street: streetVal || addressLine1Val,
        landmark: (req.body.landmark || '').trim(),
        city: cityVal,
        state: stateVal,
        country: (req.body.country || 'India').trim(),
        pincode: pincodeVal,
        isDefault: true,
      };

      if (coords) {
        newAddrData.location = { type: 'Point', coordinates: coords };
      }

      updatedAddress = await Address.create(newAddrData);
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
