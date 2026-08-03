const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const authEndpoints = {
  SENDOTP_API: BASE_URL + '/auth/sendOtp',
  SIGNUP_API: BASE_URL + '/auth/signup',
  LOGIN_API: BASE_URL + '/auth/login',
  GOOGLE_LOGIN_API: BASE_URL + '/auth/googleLogin',
};

export const bookingEndpoints = {
  CREATE_BOOKING_API: BASE_URL + '/booking',
  GET_MY_BOOKINGS_API: BASE_URL + '/booking/my-bookings',
  GET_BOOKING_DETAILS_API: BASE_URL + '/booking', // + /:bookingId
  CANCEL_BOOKING_API: BASE_URL + '/booking',       // + /:bookingId/cancel
};


export const addressEndpoints = {
  CREATE_ADDRESS_API: BASE_URL + '/address',
  GET_ADDRESSES_API: BASE_URL + '/address',
  GET_ADDRESS_DETAILS_API: BASE_URL + '/address', // + /:addressId
  UPDATE_ADDRESS_API: BASE_URL + '/address',       // + /:addressId
  DELETE_ADDRESS_API: BASE_URL + '/address',       // + /:addressId
};