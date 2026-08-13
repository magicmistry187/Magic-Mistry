import { apiConnector, BASE_URL } from '../apiConnector';

export const authEndpoints = {
  SENDOTP_API: BASE_URL + '/auth/sendOtp',
  SIGNUP_API: BASE_URL + '/auth/signup',
  LOGIN_API: BASE_URL + '/auth/login',
  GOOGLE_LOGIN_API: BASE_URL + '/auth/googleLogin',
  VERIFY_OTP: BASE_URL + '/auth/forgotPassword/verifyOtp',
  FORGOT_PASSWORD_API: BASE_URL + '/auth/forgotPassword',
};

const { SENDOTP_API, SIGNUP_API, LOGIN_API, GOOGLE_LOGIN_API , VERIFY_OTP, FORGOT_PASSWORD_API } = authEndpoints;

// Send OTP for account creation
export async function sendOtp({ email, purpose }) {
  try {
    const response = await apiConnector('POST', SENDOTP_API, { email, purpose });
    console.log('SENDOTP API RESPONSE............', response);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Could not send OTP');
    }

    return {
      success: true,
      message: response.data.message || 'OTP sent! Check your email inbox.',
    };
  } catch (error) {
    console.log('SENDOTP API ERROR............', error);
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to send OTP';
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Sign up / Create Account
export async function signUp({ fullName, email, password, phoneNumber, otp }) {
  try {
    const response = await apiConnector('POST', SIGNUP_API, {
      fullName,
      email,
      password,
      phoneNumber,
      otp,
    });
    console.log('SIGNUP API RESPONSE............', response);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Signup failed');
    }

    return {
      success: true,
      message: response.data.message || 'Account created successfully!',
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error) {
    console.log('SIGNUP API ERROR............', error);
    const errorMessage =
      error.response?.data?.message || error.message || 'Signup failed';
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Login User
export async function loginUser(email, password) {
  try {
    const response = await apiConnector('POST', LOGIN_API, {
      email,
      password,
    });
    console.log('LOGIN API RESPONSE............', response);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Login failed');
    }
    return {
      success: true,
      message: response.data.message || 'Logged in successfully!',
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error) {
    console.log('LOGIN API ERROR............', error);
    const errorMessage =
      error.response?.data?.message || error.message || 'Login failed';
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function googleLogin(accessToken) {
  try {
    const res = await apiConnector('POST', GOOGLE_LOGIN_API, { accessToken });
    console.log('GOOGLE LOGIN API RESPONSE............', res.data);
    return res.data;
  } catch (error) {
    console.error('GOOGLE LOGIN API ERROR............', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Google login failed',
    };
  }
}

export async function verifyOtpForForgotPassword({email, otp}) {
try{
  const res = await apiConnector('POST', VERIFY_OTP,{email , otp});
  console.log("VERIFY OTP RESPONSE..........", res.data);

  if(!res.data?.success || !res.data?.resetToken){
    throw new Error(res.data?.message || "OTP VERIFICATION FAILED")
  }

  return {
    success: true,
    message: res.data.message || "Otp verified successfully",
    resetToken : res.data.resetToken,
  }

}catch(err){

  console.log("VERIFY OTP ERROR......." , err);
  const errorMessage  = err.response?.data?.message || err.message || "OTP verification failed";
  return {
    success: false,
    message: errorMessage,
  };


}
}
  