
const mongoose = require("mongoose");
const Booking = require("../models/booking.model");
const VendorProfile = require("../models/vendorProfile.model");
const VendorReview = require("../models/vendorReview.model");


const createVendorReview = async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;
    const { bookingId, rating, comment = "" } = req.body;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    if (typeof comment !== "string" || comment.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment must not exceed 1000 characters",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: customerId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this customer",
      });
    }

    if (booking.bookingStatus !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "You can review only completed bookings",
      });
    }

    if (!booking.vendor) {
      return res.status(400).json({
        success: false,
        message: "No vendor is assigned to this booking",
      });
    }

    const review = await VendorReview.create({
      vendor: booking.vendor,
      customer: customerId,
      booking: booking._id,
      rating: numericRating,
      comment: comment.trim(),
    });

    // Calculate the average from all reviews 
    const result = await VendorReview.aggregate([
      {
        $match: {
          vendor: booking.vendor,
        },
      },
      {
        $group: {
          _id: "$vendor",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await VendorProfile.findOneAndUpdate(
        { user: booking.vendor },
        {
          $set: {
            rating: Math.round(result[0].averageRating * 100) / 100,
            totalReviews: result[0].totalReviews,
          },
        },
        { runValidators: true }
      );
    }

    const vendorRating = result[0]?.averageRating ?? numericRating;
const totalReviews = result[0]?.totalReviews ?? 1;

const roundedRating = Math.round(vendorRating * 100) / 100;

return res.status(201).json({
  success: true,
  message: "Review submitted successfully",
  review,
  vendorRating: roundedRating,
  totalReviews,
});
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This booking has already been reviewed",
      });
    }

    console.error("Create vendor review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

module.exports = {
  createVendorReview,
};
