import { apiConnector, BASE_URL } from '../apiConnector';

export const addressEndpoints = {
  CREATE_ADDRESS_API:  BASE_URL + '/address',        // POST   /api/address
  GET_ADDRESSES_API:   BASE_URL + '/address',        // GET    /api/address
  GET_ADDRESS_API:     BASE_URL + '/address',        // GET    /api/address/:id
  UPDATE_ADDRESS_API:  BASE_URL + '/address',        // PUT    /api/address/:id
  DELETE_ADDRESS_API:  BASE_URL + '/address',        // DELETE /api/address/:id
};

const {
  CREATE_ADDRESS_API,
  GET_ADDRESSES_API,
  GET_ADDRESS_API,
  UPDATE_ADDRESS_API,
  DELETE_ADDRESS_API,
} = addressEndpoints;

/**
 * createAddressApi — Create / Save a new user address in MongoDB
 */
export async function createAddressApi(addressData, token) {
  try {
    const res = await apiConnector('POST', CREATE_ADDRESS_API, addressData, {
      Authorization: `Bearer ${token}`,
    });

    console.log('[addressAPI] CREATE_ADDRESS_API response:', res.data);

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Could not save address');
    }

    return {
      success: true,
      address: res.data.address,
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
    const res = await apiConnector('GET', GET_ADDRESSES_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Could not fetch addresses');
    }

    return {
      success: true,
      addresses: res.data.addresses,
      count: res.data.count,
    };
  } catch (error) {
    console.error('[addressAPI] GET_ADDRESSES_API error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch addresses',
    };
  }
}

/**
 * getAddressByIdApi — Fetch a single address by its ID
 */
export async function getAddressByIdApi(addressId, token) {
  try {
    const res = await apiConnector(
      'GET',
      `${GET_ADDRESS_API}/${addressId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Could not fetch address details');
    }

    return {
      success: true,
      address: res.data.address,
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
    const res = await apiConnector(
      'PUT',
      `${UPDATE_ADDRESS_API}/${addressId}`,
      updateData,
      { Authorization: `Bearer ${token}` }
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Could not update address');
    }

    return {
      success: true,
      address: res.data.address,
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
    const res = await apiConnector(
      'DELETE',
      `${DELETE_ADDRESS_API}/${addressId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Could not delete address');
    }

    return {
      success: true,
      message: res.data.message || 'Address deleted successfully',
    };
  } catch (error) {
    console.error('[addressAPI] DELETE_ADDRESS_API error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete address',
    };
  }
}
