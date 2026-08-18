const Address = require('../models/address.model');

exports.createAddress = async (req, res) => {
  try {
    const {
      addressType,
      house,
      street,
      landmark,
      city,
      state,
      country,
      pincode,
      location,
      isDefault,
    } = req.body;

    if (!house || !street || !city || !state || !pincode || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    const addressCount = await Address.countDocuments({
      user: req.user.id,
    });

    const makeDefault = addressCount === 0 ? true : isDefault;

    if (makeDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } },
      );
    }

    const address = await Address.create({
      user: req.user.id,
      addressType,
      house,
      street,
      landmark,
      city,
      state,
      country,
      pincode,
      location,
      isDefault: makeDefault,
    });

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
      message: 'Internal Server Error',
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
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      },
    );
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
