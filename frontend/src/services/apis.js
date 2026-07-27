const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const authEndpoints = {
  SENDOTP_API: BASE_URL + '/auth/sendOtp',
  SIGNUP_API: BASE_URL + '/auth/signup',
  LOGIN_API: BASE_URL + '/auth/login',
  GOOGLE_LOGIN_API: BASE_URL + '/auth/googleLogin',
};
