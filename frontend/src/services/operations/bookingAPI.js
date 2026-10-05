import { apiConnector, BASE_URL } from "../apiConnector";

export const bookingEndpoints = {
  CREATE_BOOKING_API: BASE_URL + "/booking",
  GET_MY_BOOKINGS_API: BASE_URL + "/booking/my-bookings",
  GET_BOOKING_DETAILS_API: BASE_URL + "/booking", // + /:bookingId
  CANCEL_BOOKING_API: BASE_URL + "/booking", // + /:bookingId/cancel
  ACCEPT_BOOKING_API: BASE_URL + "/booking", // + /:bookingId/accept
};

const {
  CREATE_BOOKING_API,
  GET_MY_BOOKINGS_API,
  GET_BOOKING_DETAILS_API,
  CANCEL_BOOKING_API,
} = bookingEndpoints;

const getAuthToken = (token) =>
  token ||
  (typeof window !== "undefined"
    ? localStorage.getItem("mm_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("vendorToken")
    : null);

// Create Booking
export async function createBookingApi(formData, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "POST",
      CREATE_BOOKING_API,
      formData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    console.log("Create booking response:", res.data);

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Booking failed");
    }

    return {
      success: true,
      booking: res.data.booking,
      message: res.data.message,
    };
  } catch (error) {
    console.error("Error while creating booking:", error);
    return {
      success: false,
      message:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Booking could not be created",
    };
  }
}

// Get My Bookings
export async function getMyBookingsApi(token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "GET",
      GET_MY_BOOKINGS_API,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to fetch bookings");
    }

    return {
      success: true,
      bookings: res.data.bookings,
      count: res.data.count,
    };
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch bookings",
    };
  }
}

// Get Booking Details
export async function getBookingDetailsApi(bookingId, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "GET",
      `${GET_BOOKING_DETAILS_API}/${bookingId}`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to fetch booking details");
    }

    return {
      success: true,
      booking: res.data.booking,
    };
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch booking details",
    };
  }
}

// Cancel Booking
export async function cancelBookingApi(bookingId, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "PATCH",
      `${CANCEL_BOOKING_API}/${bookingId}/cancel`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to cancel booking");
    }

    return {
      success: true,
      booking: res.data.booking,
      message: res.data.message,
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to cancel booking",
    };
  }
}

// Get Admin Bookings
export async function getAdminBookingsApi(token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "GET",
      `${BASE_URL}/booking/admin/bookings`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to fetch admin bookings");
    }

    return {
      success: true,
      bookings: res.data.bookings,
      count: res.data.count,
    };
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch admin bookings",
    };
  }
}


// Get Vendor Bookings
export async function getVendorBookingsApi(token, radius) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "GET",
      `${BASE_URL}/booking/vendor/bookings`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
      radius ? { radius } : null,
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to fetch vendor bookings");
    }

    return {
      success: true,
      bookings: res.data.bookings,
      count: res.data.count,
    };
  } catch (error) {
    console.error("Error fetching vendor bookings:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch vendor bookings",
    };
  }
}

// Accept Booking (Vendor)
export async function acceptBookingApi(bookingId, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "PATCH",
      `${BASE_URL}/booking/${bookingId}/accept`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to accept booking");
    }

    return {
      success: true,
      booking: res.data.booking,
      message: res.data.message || "Booking accepted successfully",
    };
  } catch (error) {
    console.error("Error accepting booking:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to accept booking",
    };
  }
}

// Update Booking Status (Vendor)
export async function updateBookingStatusApi(bookingId, statusData, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "PATCH",
      `${BASE_URL}/booking/${bookingId}/status`,
      statusData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to update booking status");
    }

    return {
      success: true,
      booking: res.data.booking,
      message: res.data.message || "Booking status updated successfully",
    };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to update booking status",
    };
  }
}

// Route Verification (Vendor)
export async function routeVerificationApi(bookingId, formData, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "POST",
      `${BASE_URL}/booking/${bookingId}/route-verification`,
      formData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Route verification failed");
    }

    return {
      success: true,
      serviceExecution: res.data.serviceExecution,
      message: res.data.message || "Route verified successfully",
    };
  } catch (error) {
    console.error("Error submitting route verification:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to submit route verification",
    };
  }
}

// Submit Service Details (Vendor)
export async function submitServiceDetailsApi(bookingId, formData, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "PATCH",
      `${BASE_URL}/booking/${bookingId}/service-details`,
      formData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to submit service details");
    }

    return {
      success: true,
      serviceExecution: res.data.serviceExecution,
      message: res.data.message || "Service details submitted successfully",
    };
  } catch (error) {
    console.error("Error submitting service details:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to submit service details",
    };
  }
}

// Complete Service & Generate Final Invoice (Vendor)
export async function completeServiceApi(bookingId, completionData, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "POST",
      `${BASE_URL}/booking/${bookingId}/complete`,
      completionData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to complete service");
    }

    return {
      success: true,
      invoice: res.data.invoice,
      serviceExecution: res.data.serviceExecution,
      booking: res.data.booking,
      message: res.data.message || "Service completed and invoice generated successfully",
    };
  } catch (error) {
    console.error("Error completing service:", error);
    const existingInvoice = error.response?.data?.invoice || null;
    const isAlreadyGenerated = Boolean(
      existingInvoice ||
      (error.response?.data?.message && /already (been )?generated/i.test(error.response.data.message))
    );
    return {
      success: Boolean(existingInvoice),
      alreadyGenerated: isAlreadyGenerated,
      invoice: existingInvoice,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to complete service and generate invoice",
    };
  }
}

