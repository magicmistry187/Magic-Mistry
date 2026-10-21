const PricingConfig = require('../models/pricingConfig.model');

exports.getFuelPricing = async (req, res) => {
  try {
    let pricing = await PricingConfig.findOne();

    // Create the default configuration if it doesn't exist
    if (!pricing) {
      pricing = await PricingConfig.create({
        fuelRatePerKm: 8,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fuel pricing fetched successfully.',
      pricing,
    });
  } catch (error) {
    console.error('Get fuel pricing error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch fuel pricing.',
    });
  }
};

exports.updateFuelPricing = async (req, res) => {
  try {
    const { fuelRatePerKm } = req.body;

    if (
      fuelRatePerKm === undefined ||
      fuelRatePerKm === null ||
      fuelRatePerKm === '' ||
      !Number.isFinite(Number(fuelRatePerKm)) ||
      Number(fuelRatePerKm) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a valid fuel rate greater than or equal to zero.',
      });
    }

    const updateData = {
      fuelRatePerKm: Number(fuelRatePerKm),
    };

    // Record who updatd the configuration
    if (req.user?.id) {
      updateData.updatedBy = req.user.id;
    }

    const pricing = await PricingConfig.findOneAndUpdate(
      {},
      {
        $set: updateData,
        $setOnInsert: {
          fuelRatePerKm: 8,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: 'Fuel pricing updated successfully.',
      pricing,
    });
  } catch (error) {
    console.error('Update fuel pricing error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update fuel pricing.',
    });
  }
};
