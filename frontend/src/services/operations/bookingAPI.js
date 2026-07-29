import { apiConnector } from '../apiConnector';
import { bookingEndpoints } from '../apis';

const { CREATE_BOOKING_API } = bookingEndpoints;

//create booking
export async function createBooking(formData) {
  try {
    const token = localStorage.getItem('token');
    const res = await apiConnector('POST', CREATE_BOOKING_API, formData, {
      Authorization: `Bearer ${token}`,
    });

    console.log('create booking data', res.data.booking);

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Booking failed');

      return res.data;
    }
  } catch (error) {
    console.log('error while booking', error);
    return {
      success: false,
      message: 'Booking is not created',
      error: error.message,
    };
  }
}
