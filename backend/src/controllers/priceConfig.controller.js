const PriceConfig = require('../models/priceConfig.model');

exports.getFuelPricing = async (req, res) => {
  try {
    let pricing = await PriceConfig.findOne();

    // Create the default configuration if it doesn't exist
    if (!pricing) {
      pricing = await PriceConfig.create({
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

    // Validate fuel rate
    if (
      fuelRatePerKm === undefined ||
      fuelRatePerKm === null ||
      fuelRatePerKm === '' ||
      !Number.isFinite(Number(fuelRatePerKm)) ||
      Number(fuelRatePerKm) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid fuel rate greater than or equal to zero.',
      });
    }

    const updateData = {
      fuelRatePerKm: Number(fuelRatePerKm),
    };

    // Store admin ID if available
    if (req.user?.id) {
      updateData.updatedBy = req.user.id;
    }

    const pricing = await PriceConfig.findOneAndUpdate(
      {},
      {
        $set: updateData,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
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
