import { apiConnector, BASE_URL } from '../apiConnector';

export const addressEndpoints = {
  CREATE_ADDRESS_API: BASE_URL + '/address',
  GET_ADDRESSES_API:  BASE_URL + '/address',
  GET_ADDRESS_API:    BASE_URL + '/address',
  UPDATE_ADDRESS_API: BASE_URL + '/address',
  DELETE_ADDRESS_API: BASE_URL + '/address',
};

const {
  CREATE_ADDRESS_API,
  GET_ADDRESSES_API,
  GET_ADDRESS_API,
  UPDATE_ADDRESS_API,
  DELETE_ADDRESS_API,
} = addressEndpoints;


const getAuthToken = (token) =>
  token ||
  (typeof window !== 'undefined'
    ? localStorage.getItem('mm_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('vendorToken')
    : null);

/**
 * createAddressApi — Create / Save a new user address in MongoDB
 */
export async function createAddressApi(addressData, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      'POST',
      CREATE_ADDRESS_API,
      addressData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    console.log('[addressAPI] CREATE_ADDRESS_API response:', res.data);

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Could not save address');
    }

    return {
      success: true,
      address: res.data.address || res.data.data,
      message: res.data.message || 'Address saved successfully',
    };
  } catch (error) {
    console.error('[addressAPI] CREATE_ADDRESS_API error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to save address',
    };
  }
}

/**
 * getAddressesApi — Fetch all saved addresses for the logged-in user
 */
export async function getAddressesApi(token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      'GET',
      GET_ADDRESSES_API,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Could not fetch addresses');
    }

    const list = res.data.addresses || res.data.data || [];

    return {
      success: true,
      addresses: list,
      count: res.data.count ?? list.length,
    };
  } catch (error) {
    console.error('[addressAPI] GET_ADDRESSES_API error:', error);
    return {
      success: false,
      addresses: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch addresses',
    };
  }
}

/**
 * getAddressByIdApi — Fetch a single address by its ID
 */
export async function getAddressByIdApi(addressId, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      'GET',
      `${GET_ADDRESS_API}/${addressId}`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Could not fetch address details');
    }

    return {
      success: true,
      address: res.data.address || res.data.data,
    };
  } catch (error) {
    console.error('[addressAPI] GET_ADDRESS_API error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch address',
    };
  }
}

/**
 * updateAddressApi — Update an existing address by ID
 */
export async function updateAddressApi(addressId, updateData, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      'PUT',
      `${UPDATE_ADDRESS_API}/${addressId}`,
      updateData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Could not update address');
    }

    return {
      success: true,
      address: res.data.address || res.data.data,
      message: res.data.message || 'Address updated successfully',
    };
  } catch (error) {
    console.error('[addressAPI] UPDATE_ADDRESS_API error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update address',
    };
  }
}

/**
 * deleteAddressApi — Delete an address by ID
 */
export async function deleteAddressApi(addressId, token) {
  try {
    const authToken = getAuthToken(token);
    const cleanId = (addressId && addressId !== 'undefined' && addressId !== 'null') ? addressId : '';
    const endpoint = cleanId ? `${DELETE_ADDRESS_API}/${cleanId}` : DELETE_ADDRESS_API;
    const res = await apiConnector(
      'DELETE',
      endpoint,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    return {
      success: res.data?.success !== false,
      message: res.data?.message || 'Address deleted successfully',
    };
  } catch (error) {
    console.error('[addressAPI] DELETE_ADDRESS_API error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete address',
    };
  }
}

/**
 * saveVendorAddressApi — Save vendor service address into the User Location Save module.
 *
 * Calls POST /api/address — the backend accepts both customer AND vendor roles
 * on this route via the isCustomerOrVendor middleware.
 *
 * @param {object} addressData  Structured address payload from VendorAddressModal
 * @param {string} token        Vendor JWT token
 */
export async function saveVendorAddressApi(addressData, token) {
  try {
    const targetId = addressData.id || addressData._id || addressData.addressId;

    if (targetId && targetId !== 'undefined' && targetId !== 'null') {
      return await updateAddressApi(targetId, addressData, token);
    } else {
      return await createAddressApi(addressData, token);
    }
  } catch (error) {
    console.error('[addressAPI] saveVendorAddressApi error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to save vendor address',
    };
  }
}
