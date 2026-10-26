
const mongoose = require("mongoose");
const ServiceCategory = require("../models/serviceCategory.model");


exports.createServiceCategory = async (req, res) => {
  try {
    const {
      categoryName,
      icon,
      groupCategory,
      description,
      baseDiagnosticAmount,
      subServices = [],
    } = req.body;

    if (
      !categoryName?.trim() ||
      baseDiagnosticAmount === undefined ||
      baseDiagnosticAmount === null ||
      baseDiagnosticAmount === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Category name and diagnostic amount are required",
      });
    }

    const diagnosticAmount = Number(baseDiagnosticAmount);

    if (!Number.isFinite(diagnosticAmount) || diagnosticAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Diagnostic amount must be a non-negative number",
      });
    }

    if (!Array.isArray(subServices)) {
      return res.status(400).json({
        success: false,
        message: "Sub-services must be an array",
      });
    }

    const formattedSubServices = [];

    for (const service of subServices) {
      if (
        typeof service.title !== "string" ||
        !service.title.trim() ||
        service.customerPrice === undefined ||
        service.customerPrice === null ||
        service.customerPrice === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Every sub-service needs a title and price",
        });
      }

      const price = Number(service.customerPrice);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${service.title}`,
        });
      }

      formattedSubServices.push({
        title: service.title.trim(),
        customerPrice: price,
        isVisible: true,
      });
    }

    const category = await ServiceCategory.create({
      categoryName: categoryName.trim(),
      icon: typeof icon === "string" && icon.trim() ? icon.trim() : "🔧",
      groupCategory:
        typeof groupCategory === "string" && groupCategory.trim()
          ? groupCategory.trim()
          : "Appliance",
      description:
        typeof description === "string" ? description.trim() : "",
      baseDiagnosticAmount: diagnosticAmount,
      isVisible: true,
      subServices: formattedSubServices,
    });

    return res.status(201).json({
      success: true,
      message: "Service category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create service category:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create service category",
    });
  }
};


exports.getAllServiceCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get service categories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch service categories",
    });
  }
};


exports.updateServiceCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      categoryName,
      icon,
      groupCategory,
      description,
      baseDiagnosticAmount,
    } = req.body;

    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const updates = {};

    if (categoryName !== undefined) {
      if (typeof categoryName !== "string" || !categoryName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }
      updates.categoryName = categoryName.trim();
    }

    if (icon !== undefined) {
      if (typeof icon !== "string") {
        return res.status(400).json({
          success: false,
          message: "Icon must be a string",
        });
      }
      updates.icon = icon.trim();
    }

    if (groupCategory !== undefined) {
      if (
        typeof groupCategory !== "string" ||
        !groupCategory.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Group category cannot be empty",
        });
      }
      updates.groupCategory = groupCategory.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Description must be a string",
        });
      }
      updates.description = description.trim();
    }

    if (baseDiagnosticAmount !== undefined) {
      if (
        baseDiagnosticAmount === "" ||
        !Number.isFinite(Number(baseDiagnosticAmount)) ||
        Number(baseDiagnosticAmount) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid diagnostic amount",
        });
      }

      updates.baseDiagnosticAmount = Number(baseDiagnosticAmount);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const category = await ServiceCategory.findByIdAndUpdate(
      categoryId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update service category:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update service category",
    });
  }
};


exports.toggleCategoryVisibility = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await ServiceCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    category.isVisible = !category.isVisible;
    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category ${
        category.isVisible ? "shown" : "hidden"
      } successfully`,
      data: category,
    });
  } catch (error) {
    console.error("Toggle category visibility:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change category visibility",
    });
  }
};


exports.updateSubService = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { subServiceId, title, customerPrice } = req.body;

    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Sub-service title cannot be empty",
      });
    }

    if (
      customerPrice !== undefined &&
      (customerPrice === "" ||
        !Number.isFinite(Number(customerPrice)) ||
        Number(customerPrice) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub-service price",
      });
    }

    if (subServiceId !== undefined) {
      if (!mongoose.isValidObjectId(subServiceId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid sub-service ID",
        });
      }

      if (title === undefined && customerPrice === undefined) {
        return res.status(400).json({
          success: false,
          message: "Provide a title or price to update",
        });
      }
    } else if (
      typeof title !== "string" ||
      !title.trim() ||
      customerPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "A title and price are required to add a sub-service",
      });
    }

    const category = await ServiceCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    if (subServiceId !== undefined) {
      const subService = category.subServices.id(subServiceId);

      if (!subService) {
        return res.status(404).json({
          success: false,
          message: "Sub-service not found",
        });
      }

      if (title !== undefined) subService.title = title.trim();

      if (customerPrice !== undefined) {
        subService.customerPrice = Number(customerPrice);
      }
    } else {
      category.subServices.push({
        title: title.trim(),
        customerPrice: Number(customerPrice),
        isVisible: true,
      });
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message:
        subServiceId !== undefined
          ? "Sub-service updated successfully"
          : "Sub-service added successfully",
      data: category,
    });
  } catch (error) {
    console.error("Add/update sub-service:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add or update sub-service",
    });
  }
};


exports.toggleSubServiceVisibility = async (req, res) => {
  try {
    const { categoryId, subServiceId } = req.params;

    if (
      !mongoose.isValidObjectId(categoryId) ||
      !mongoose.isValidObjectId(subServiceId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID or sub-service ID",
      });
    }

    const category = await ServiceCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    const subService = category.subServices.id(subServiceId);

    if (!subService) {
      return res.status(404).json({
        success: false,
        message: "Sub-service not found",
      });
    }

    subService.isVisible = !subService.isVisible;
    await category.save();

    return res.status(200).json({
      success: true,
      message: `Sub-service ${
        subService.isVisible ? "shown" : "hidden"
      } successfully`,
      data: subService,
    });
  } catch (error) {
    console.error("Toggle sub-service visibility:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change sub-service visibility",
    });
  }
};


exports.deleteServiceCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await ServiceCategory.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service category permanently deleted",
    });
  } catch (error) {
    console.error("Delete service category:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete service category",
    });
  }
};


exports.deleteSubService = async (req, res) => {
  try {
    const { categoryId, subServiceId } = req.params;

    if (
      !mongoose.isValidObjectId(categoryId) ||
      !mongoose.isValidObjectId(subServiceId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID or sub-service ID",
      });
    }

    const category = await ServiceCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    const subService = category.subServices.id(subServiceId);

    if (!subService) {
      return res.status(404).json({
        success: false,
        message: "Sub-service not found",
      });
    }

    subService.deleteOne();
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Sub-service permanently deleted",
      data: category,
    });
  } catch (error) {
    console.error("Delete sub-service:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete sub-service",
    });
  }
};
