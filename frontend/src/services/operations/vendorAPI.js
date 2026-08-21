import { apiConnector, BASE_URL } from "../apiConnector";

export const vendorEndpoints = {
  VENDOR_LOGIN_API: BASE_URL + "/vendor/login",
  APPROVE_VENDOR_APP_API: BASE_URL + "/vendor-application",
  VENDOR_CREATE_API: BASE_URL + "/vendor/create",
};

const { VENDOR_LOGIN_API, APPROVE_VENDOR_APP_API, VENDOR_CREATE_API } = vendorEndpoints;

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

