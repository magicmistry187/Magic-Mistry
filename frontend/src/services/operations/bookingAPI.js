import { apiConnector } from '../apiConnector';
import { bookingEndpoints } from '../apis';

const {
  CREATE_BOOKING_API,
  GET_MY_BOOKINGS_API,
  GET_BOOKING_DETAILS_API,
  CANCEL_BOOKING_API,
} = bookingEndpoints;

// Create Booking
export async function createBookingApi(formData, token) {
  try {
    const res = await apiConnector('POST', CREATE_BOOKING_API, formData, {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type here — apiConnector handles it automatically for FormData
    });

    console.log('Create booking response:', res.data);

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Booking failed');
    }

    return {
      success: true,
      booking: res.data.booking,
      message: res.data.message,
    };
  } catch (error) {
    console.error('Error while creating booking:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Booking could not be created',
    };
  }
}

// Get My Bookings
export async function getMyBookingsApi(token) {
  try {
    const res = await apiConnector('GET', GET_MY_BOOKINGS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to fetch bookings');
    }

    return {
      success: true,
      bookings: res.data.bookings,
      count: res.data.count,
    };
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch bookings',
    };
  }
}

// Get Booking Details
export async function getBookingDetailsApi(bookingId, token) {
  try {
    const res = await apiConnector('GET', `${GET_BOOKING_DETAILS_API}/${bookingId}`, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to fetch booking details');
    }

    return {
      success: true,
      booking: res.data.booking,
    };
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch booking details',
    };
  }
}

// Cancel Booking
export async function cancelBookingApi(bookingId, token) {
  try {
    const res = await apiConnector('PATCH', `${CANCEL_BOOKING_API}/${bookingId}/cancel`, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to cancel booking');
    }

    return {
      success: true,
      booking: res.data.booking,
      message: res.data.message,
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to cancel booking',
    };
  }
}
