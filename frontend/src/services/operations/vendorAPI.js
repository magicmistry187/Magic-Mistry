import { apiConnector, BASE_URL } from "../apiConnector";

export const vendorEndpoints = {
  VENDOR_LOGIN_API: BASE_URL + "/vendor/login",
  APPROVE_VENDOR_APP_API: BASE_URL + "/vendor-application",
  VENDOR_CREATE_API: BASE_URL + "/vendor/create",
  GET_VENDOR_PROFILE_API: BASE_URL + "/vendor/profile",
  UPDATE_VENDOR_PROFILE_API: BASE_URL + "/vendor/profile-update",
  UPDATE_VENDOR_PROFILE_IMAGE_API: BASE_URL + "/vendor/profile-image-update",
};

const { 
  VENDOR_LOGIN_API, 
  APPROVE_VENDOR_APP_API, 
  VENDOR_CREATE_API, 
  GET_VENDOR_PROFILE_API,
  UPDATE_VENDOR_PROFILE_API,
  UPDATE_VENDOR_PROFILE_IMAGE_API,
} = vendorEndpoints;

export async function loginVendor(login, password) {
  try {
    const response = await apiConnector("POST", VENDOR_LOGIN_API, {
      login,
      password,
    });
    console.log("VENDOR LOGIN API RESPONSE............", response);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Vendor login failed");
    }
    // Backend returns token at top-level response.data.token and vendor
    // details under response.data.vendor — extract correctly
    const token = response.data.token;
    const vendorData = response.data.vendor || response.data.user || {};
    return {
      success: true,
      message: response.data.message || "Vendor logged in successfully!",
      token,
      user: { ...vendorData, role: 'vendor' },
    };
  } catch (error) {
    console.log("VENDOR LOGIN API ERROR............", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Vendor login failed";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function approveVendorApplication(applicationId, token) {
  console.log("Approve is called with ID:", applicationId);
  try {
    const response = await apiConnector(
      "PATCH",
      `${APPROVE_VENDOR_APP_API}/${applicationId}/approve`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("APPROVE VENDOR APP API RESPONSE............", response);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Approval failed");
    }
    return {
      success: true,
      message: response.data.message || "Vendor approved successfully!",
      credentials: response.data.credentials,
      vendor: response.data.vendor,
    };
  } catch (error) {
    console.log("APPROVE VENDOR APP API ERROR............", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Approval failed";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function createVendorByAdminApi(vendorData, token) {
  console.log("create vendor by admin is call")
  try {
    // Map frontend form fields to backend-expected field names
    const payload = {
      fullName: vendorData.fullName,
      email: vendorData.email,
      phoneNumber: vendorData.phoneNumber || vendorData.phone || '',  // backend expects `phoneNumber`
      specialization: vendorData.specialization,
      serviceArea: vendorData.serviceArea,
      experience: vendorData.experience,
    };

    const response = await apiConnector(
      "POST",
      VENDOR_CREATE_API,
      payload,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("CREATE VENDOR API RESPONSE............", response);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to create vendor");
    }
    return {
      success: true,
      message: response.data.message || "Vendor credentials generated successfully!",
      credentials: response.data.credentials,
      vendor: response.data.vendor,
    };
  } catch (error) {
    console.log("CREATE VENDOR API ERROR............", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to create vendor credentials";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function getAllVendorApplications(token) {
  try {
    const response = await apiConnector("GET", APPROVE_VENDOR_APP_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch applications");
    }
    return {
      success: true,
      applications: response.data.applications,
    };
  } catch (error) {
    console.log("GET ALL VENDOR APP API ERROR............", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to fetch applications",
    };
  }
}

export async function rejectVendorApplication(applicationId, token) {
  try {
    const response = await apiConnector(
      "PATCH",
      `${APPROVE_VENDOR_APP_API}/${applicationId}/reject`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Rejection failed");
    }
    return {
      success: true,
      message: response.data.message || "Vendor rejected successfully!",
    };
  } catch (error) {
    console.log("REJECT VENDOR APP API ERROR............", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Rejection failed",
    };
  }
}

export async function submitVendorApplication(formData) {
  try {
    const response = await apiConnector(
      "POST",
      `${APPROVE_VENDOR_APP_API}/apply`,
      formData
    );
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to submit application");
    }
    return {
      success: true,
      message: response.data.message || "Application submitted successfully!",
    };
  } catch (error) {
    console.log("SUBMIT VENDOR APP API ERROR............", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to submit application",
    };
  }
}

export async function getVendorCredentialsApi(applicationId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${APPROVE_VENDOR_APP_API}/${applicationId}/credentials`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("GET VENDOR CREDENTIALS API RESPONSE............", response);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch credentials");
    }
    return {
      success: true,
      message: response.data.message || "Vendor credentials retrieved successfully!",
      credentials: response.data.credentials,
      vendor: response.data.vendor,
    };
  } catch (error) {
    console.log("GET VENDOR CREDENTIALS API ERROR............", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to fetch vendor credentials";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function getVendorProfileApi(token) {
  try {
    const authToken = token || (typeof window !== 'undefined' && (localStorage.getItem('mm_token') || localStorage.getItem('token')));
    const response = await apiConnector("GET", GET_VENDOR_PROFILE_API, null, {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    });
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch vendor profile");
    }
    return {
      success: true,
      vendorProfile: response.data.vendorProfile,
    };
  } catch (error) {
    console.log("GET VENDOR PROFILE ERROR............", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to fetch vendor profile",
    };
  }
}

/**
 * Updates the vendor's profile.
 * Expects `formData` to be an instance of FormData, allowing for image upload 
 * as well as JSON fields like bankDetails and appliancesServed.
 * 
 * @param {FormData} formData - The multipart form data containing vendor details and/or image.
 * @param {string} token - The user's auth token.
 * @returns {Object} The API response.
 */
export async function updateVendorProfileApi(formData, token) {
  try {
    const authToken = token || (typeof window !== 'undefined' && (localStorage.getItem('mm_token') || localStorage.getItem('token')));
    const response = await apiConnector("PUT", UPDATE_VENDOR_PROFILE_API, formData, {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    });
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to update vendor profile");
    }
    
    return {
      success: true,
      message: response.data.message || "Vendor profile updated successfully!",
      data: response.data.data, // This includes the updated user and vendorProfile
    };
  } catch (error) {
    console.log("UPDATE VENDOR PROFILE ERROR............", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to update vendor profile",
    };
  }
}

/**
 * Uploads a new profile image for the vendor.
 * Calls POST /vendor/profile-image-update with a FormData containing the image file.
 *
 * @param {File} imageFile - The image File object to upload.
 * @param {string} token - The user's auth token.
 * @returns {Object} The API response with the updated profileImage { url, fileId }.
 */
export async function updateVendorProfileImageApi(imageFile, token) {
  try {
    const authToken = token || (typeof window !== 'undefined' && (localStorage.getItem('mm_token') || localStorage.getItem('token')));
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    const response = await apiConnector("POST", UPDATE_VENDOR_PROFILE_IMAGE_API, formData, {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to update profile image");
    }

    return {
      success: true,
      message: response.data.message || "Profile image updated successfully!",
      profileImage: response.data.profileImage, // { url, fileId }
    };
  } catch (error) {
    console.log("UPDATE VENDOR PROFILE IMAGE ERROR............", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to update profile image",
    };
  }
}
