const Inventory = require('../models/inventory.model');

// controller post man pe checck krna h 'GET' se

exports.createInventory = async (req, res) => {
  try {
    // console.log("create inventory called ",req.body)
    const {
      itemName,
      category,
      skuCode,
      stockQuantity,
      reorderThreshold,
      unitPrice,
      supplierName,
    } = req.body;

    if (!itemName || !category || !skuCode || unitPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item name, category, SKU code and unit price are required',
      });
    }

    const existingItem = await Inventory.findOne({
      skuCode: skuCode.toUpperCase(),
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'An inventory item with this SKU code already exists',
      });
    }

    const inventoryId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingInventoryId = await Inventory.findOne({ inventoryId });

    if (existingInventoryId) {
      return res.status(409).json({
        success: false,
        message: 'Inventory ID generation failed. Please try again',
      });
    }

    const quantity = stockQuantity !== undefined ? stockQuantity : 0;

    const inventory = await Inventory.create({
      inventoryId,
      itemName,
      category,
      skuCode: skuCode.toUpperCase(),
      stockQuantity: quantity,
      reorderThreshold: reorderThreshold !== undefined ? reorderThreshold : 10,
      unitPrice,
      supplierName: supplierName || '',
      createdBy: req.user?.id || null,
      lastRestockedAt: quantity > 0 ? new Date() : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      inventory,
    });
  } catch (error) {
    console.error('Create Inventory Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message,
    });
  }
};

exports.getAllInventory = async (req, res) => {
  try {
    const { category, isActive, search, stockStatus } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        {
          itemName: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          skuCode: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    if (stockStatus === 'Out of Stock') {
      filter.stockQuantity = 0;
    }

    if (stockStatus === 'Low Stock') {
      filter.$expr = {
        $and: [
          { $gt: ['$stockQuantity', 0] },
          { $lte: ['$stockQuantity', '$reorderThreshold'] },
        ],
      };
    }

    if (stockStatus === 'In Stock') {
      filter.$expr = {
        $gt: ['$stockQuantity', '$reorderThreshold'],
      };
    }

    const inventory = await Inventory.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    console.error('Get Inventory Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message,
    });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    const inventory = await Inventory.findOne({
      inventoryId: inventoryId,
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    return res.status(200).json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error('Get Inventory By ID Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory item',
      error: error.message,
    });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    const {
      itemName,
      category,
      skuCode,
      reorderThreshold,
      unitPrice,
      supplierName,
      isActive,
    } = req.body;

    const inventory = await Inventory.findOne({
      inventoryId: inventoryId,
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    if (skuCode && skuCode.toUpperCase() !== inventory.skuCode) {
      const existingSku = await Inventory.findOne({
        skuCode: skuCode.toUpperCase(),
        _id: { $ne: inventory._id },
      });

      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: 'Another inventory item already uses this SKU code',
        });
      }

      inventory.skuCode = skuCode.toUpperCase();
    }

    if (itemName !== undefined) {
      inventory.itemName = itemName;
    }

    if (category !== undefined) {
      inventory.category = category;
    }

    if (reorderThreshold !== undefined) {
      inventory.reorderThreshold = reorderThreshold;
    }

    if (unitPrice !== undefined) {
      inventory.unitPrice = unitPrice;
    }

    if (supplierName !== undefined) {
      inventory.supplierName = supplierName;
    }

    if (isActive !== undefined) {
      inventory.isActive = isActive;
    }

    await inventory.save();

    return res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      inventory,
    });
  } catch (error) {
    console.error('Update Inventory Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message,
    });
  }
};
exports.deleteInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    const inventory = await Inventory.findOne({ inventoryId });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    await Inventory.deleteOne({ inventoryId });

    return res.status(200).json({
      success: true,
      message: 'Inventory item permanently deleted',
    });
  } catch (error) {
    console.error('Delete Inventory Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete inventory item',
      error: error.message,
    });
  }
};

exports.deactivateInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    const inventory = await Inventory.findOne({ inventoryId });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    inventory.isActive = false;

    await inventory.save();

    return res.status(200).json({
      success: true,
      message: 'Inventory item deactivated successfully',
      inventory,
    });
  } catch (error) {
    console.error('Deactivate Inventory Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate inventory item',
      error: error.message,
    });
  }
};
exports.restockInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Restock quantity must be greater than 0',
      });
    }

    const inventory = await Inventory.findOne({ inventoryId });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    inventory.stockQuantity += Number(quantity);
    inventory.lastRestockedAt = new Date();

    await inventory.save();

    return res.status(200).json({
      success: true,
      message: 'Inventory restocked successfully',
      inventory,
    });
  } catch (error) {
    console.error('Restock Inventory Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to restock inventory',
      error: error.message,
    });
  }
};

exports.reduceInventoryStock = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const inventory = await Inventory.findOne({ inventoryId });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    if (inventory.stockQuantity < Number(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
        availableStock: inventory.stockQuantity,
      });
    }

    inventory.stockQuantity -= Number(quantity);

    await inventory.save();

    return res.status(200).json({
      success: true,
      message: "Inventory stock reduced successfully",
      inventory,
    });
  } catch (error) {
    console.error("Reduce Inventory Stock Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reduce inventory stock",
      error: error.message,
    });
  }
};

exports.getLowStockInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({
      isActive: true,
      $expr: {
        $lte: ['$stockQuantity', '$reorderThreshold'],
      },
    }).sort({ stockQuantity: 1 });

    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    console.error('Get Low Stock Inventory Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock inventory',
      error: error.message,
    });
  }
};
