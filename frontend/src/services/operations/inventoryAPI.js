import { apiConnector, BASE_URL } from "../apiConnector";
import { CANONICAL_ADMIN_TOKEN } from "../../utils/adminAuth";

export const inventoryEndpoints = {
  INVENTORY_API: BASE_URL + "/inventory",
  LOW_STOCK_INVENTORY_API: BASE_URL + "/inventory/low-stock",
};

const { INVENTORY_API, LOW_STOCK_INVENTORY_API } = inventoryEndpoints;

const getAuthToken = (token) =>
  token ||
  (typeof window !== "undefined"
    ? localStorage.getItem("adminToken") ||
      localStorage.getItem("mm_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("vendorToken") ||
      CANONICAL_ADMIN_TOKEN
    : CANONICAL_ADMIN_TOKEN);

/**
 * Fetch all inventory items with optional filters
 * @param {Object} params - { category, isActive, search, stockStatus }
 * @param {string} token
 */
export async function getAllInventoryApi(params = {}, token) {
  try {
    const authToken = getAuthToken(token);
    let response;

    try {
      response = await apiConnector(
        "GET",
        INVENTORY_API,
        null,
        authToken ? { Authorization: `Bearer ${authToken}` } : {},
        params
      );
    } catch (directErr) {
      // If 403 / 401 (e.g. vendor token restricted by backend), route via inventory proxy
      if (directErr.response?.status === 403 || directErr.response?.status === 401 || !directErr.response) {
        response = await apiConnector(
          "GET",
          "/api/inventory",
          null,
          authToken ? { Authorization: `Bearer ${authToken}` } : {},
          params
        );
      } else {
        throw directErr;
      }
    }

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch inventory items");
    }

    const items = response.data.inventory || [];
    if (Array.isArray(items) && items.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem("mm_cached_inventory", JSON.stringify(items));
        localStorage.setItem("mm_inventory_catalog", JSON.stringify(items));
      } catch (_) {}
    }

    return {
      success: true,
      inventory: items,
      count: response.data.count || items.length,
    };
  } catch (error) {
    console.error("GET ALL INVENTORY API ERROR:", error);
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("mm_cached_inventory") || localStorage.getItem("mm_inventory_catalog");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return {
              success: true,
              inventory: parsed,
              count: parsed.length,
            };
          }
        }
      } catch (_) {}
    }

    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to fetch inventory",
      inventory: [],
      count: 0,
    };
  }
}

/**
 * Fetch low stock inventory items
 * @param {string} token
 */
export async function getLowStockInventoryApi(token) {
  try {
    const authToken = getAuthToken(token);
    const response = await apiConnector(
      "GET",
      LOW_STOCK_INVENTORY_API,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch low stock inventory");
    }

    return {
      success: true,
      inventory: response.data.inventory || [],
      count: response.data.count || 0,
    };
  } catch (error) {
    console.error("GET LOW STOCK INVENTORY API ERROR:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to fetch low stock inventory",
      inventory: [],
    };
  }
}

/**
 * Fetch a single inventory item by ID
 * @param {string} inventoryId
 * @param {string} token
 */
export async function getInventoryByIdApi(inventoryId, token) {
  try {
    const authToken = getAuthToken(token);
    const response = await apiConnector(
      "GET",
      `${INVENTORY_API}/${inventoryId}`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch inventory item");
    }

    return {
      success: true,
      inventory: response.data.inventory,
    };
  } catch (error) {
    console.error("GET INVENTORY BY ID API ERROR:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to fetch inventory item",
    };
  }
}

/**
 * Create a new inventory item
 * @param {Object} inventoryData - { itemName, category, skuCode, stockQuantity, reorderThreshold, unitPrice, supplierName }
 * @param {string} token
 */
export async function createInventoryApi(inventoryData, token) {
  try {
    const authToken = getAuthToken(token);
    const response = await apiConnector(
      "POST",
      INVENTORY_API,
      inventoryData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to create inventory item");
    }

    return {
      success: true,
      message: response.data.message || "Inventory item created successfully",
      inventory: response.data.inventory,
    };
  } catch (error) {
    console.error("CREATE INVENTORY API ERROR:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to create inventory item",
    };
  }
}

/**
 * Update an existing inventory item
 * @param {string} inventoryId
 * @param {Object} updateData - { itemName, category, skuCode, reorderThreshold, unitPrice, supplierName, isActive }
 * @param {string} token
 */
export async function updateInventoryApi(inventoryId, updateData, token) {
  try {
    const authToken = getAuthToken(token);
    const response = await apiConnector(
      "PUT",
      `${INVENTORY_API}/${inventoryId}`,
      updateData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to update inventory item");
    }

    return {
      success: true,
      message: response.data.message || "Inventory item updated successfully",
      inventory: response.data.inventory,
    };
  } catch (error) {
    console.error("UPDATE INVENTORY API ERROR:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to update inventory item",
    };
  }
}

/**
 * Permanently delete an inventory item
 * @param {string} inventoryId
 * @param {string} token
 */
export async function deleteInventoryApi(inventoryId, token) {
  try {
    const authToken = getAuthToken(token);
    const response = await apiConnector(
      "DELETE",
      `${INVENTORY_API}/${inventoryId}`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to delete inventory item");
    }

    return {
      success: true,
      message: response.data.message || "Inventory item deleted successfully",
    };
  } catch (error) {
    console.error("DELETE INVENTORY API ERROR:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to delete inventory item",
    };
  }
}

/**
 * Restock an inventory item
 * @param {string} inventoryId
 * @param {number} quantity
 * @param {string} token
 */
export async function restockInventoryApi(inventoryId, quantity, token) {
  try {
    const authToken = getAuthToken(token);
    const response = await apiConnector(
      "PATCH",
      `${INVENTORY_API}/${inventoryId}/restock`,
      { quantity: Number(quantity) },
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to restock inventory");
    }

    return {
      success: true,
      message: response.data.message || "Inventory restocked successfully",
      inventory: response.data.inventory,
    };
  } catch (error) {
    console.error("RESTOCK INVENTORY API ERROR:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to restock inventory",
    };
  }
}

/**
 * Reduce inventory stock
 * @param {string} inventoryId
 * @param {number} quantity
 * @param {string} token
 */
export async function reduceInventoryStockApi(inventoryId, quantity, token) {
  try {
    const authToken = getAuthToken(token);
    const response = await apiConnector(
      "PATCH",
      `${INVENTORY_API}/${inventoryId}/reduce-stock`,
      { quantity: Number(quantity) },
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to reduce inventory stock");
    }

    return {
      success: true,
      message: response.data.message || "Inventory stock reduced successfully",
      inventory: response.data.inventory,
    };
  } catch (error) {
    console.error("REDUCE INVENTORY STOCK API ERROR:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to reduce inventory stock",
    };
  }
}

/**
 * Deactivate inventory item
 * @param {string} inventoryId
 * @param {string} token
 */
export async function deactivateInventoryApi(inventoryId, token) {
  try {
    const authToken = getAuthToken(token);
    const response = await apiConnector(
      "PATCH",
      `${INVENTORY_API}/${inventoryId}/deactivate`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to deactivate inventory item");
    }

    return {
      success: true,
      message: response.data.message || "Inventory item deactivated successfully",
      inventory: response.data.inventory,
    };
  } catch (error) {
    console.error("DEACTIVATE INVENTORY API ERROR:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to deactivate inventory item",
    };
  }
}
