import { apiConnector, BASE_URL } from "../apiConnector";

export const vendorReviewEndpoints = {
  CREATE_VENDOR_REVIEW_API: BASE_URL + "/vendor-reviews",
};

const { CREATE_VENDOR_REVIEW_API } = vendorReviewEndpoints;

const getAuthToken = (token) =>
  token ||
  (typeof window !== "undefined"
    ? localStorage.getItem("mm_token") ||
      localStorage.getItem("token")
    : null);

/**
 * Submit customer review & star rating for a completed service booking.
 * Calls backend POST /api/vendor-reviews
 * Protected by customer authentication.
 *
 * @param {Object} reviewData - { bookingId, rating (1-5), comment }
 * @param {string|null} token - Optional auth token override
 */
export async function createVendorReviewApi({ bookingId, rating, comment = "" }, token = null) {
  try {
    const authToken = getAuthToken(token);
    const numericRating = Number(rating);

    if (!bookingId) {
      throw new Error("A valid completed booking ID is required to submit a review.");
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new Error("Rating must be a whole number between 1 and 5.");
    }

    const payload = {
      bookingId: String(bookingId).trim(),
      rating: numericRating,
      comment: typeof comment === "string" ? comment.trim().slice(0, 1000) : "",
    };

    const res = await apiConnector(
      "POST",
      CREATE_VENDOR_REVIEW_API,
      payload,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to submit review");
    }

    return {
      success: true,
      data: res.data.review,
      review: res.data.review,
      vendorRating: res.data.vendorRating,
      totalReviews: res.data.totalReviews,
      message: res.data.message || "Review submitted successfully",
    };
  } catch (err) {
    console.error("Error creating vendor review:", err);
    const isConflict = err.response?.status === 409;
    return {
      success: false,
      isConflict,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to submit review",
    };
  }
}

