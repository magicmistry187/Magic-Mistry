import { apiConnector, BASE_URL } from "../apiConnector";
import { getAdminToken } from "../../utils/adminAuth";

export const serviceCategoryEndpoints = {
  SERVICE_CATEGORIES_API: BASE_URL + "/service-categories",
};

const { SERVICE_CATEGORIES_API } = serviceCategoryEndpoints;

/**
 * Helper to retrieve an admin authentication token from parameter or client storage.
 */
const getAuthToken = (token) =>
  token ||
  getAdminToken() ||
  (typeof window !== "undefined"
    ? localStorage.getItem("adminToken") ||
      localStorage.getItem("mm_token") ||
      localStorage.getItem("token")
    : null);

/**
 * Normalizes a backend MongoDB ServiceCategory document into the frontend UI service format.
 */
export function mapServiceCategoryToUI(cat, fallbackIndex = 0) {
  if (!cat) return null;
  return {
    id: cat._id || `cat_${fallbackIndex + 1}`,
    _id: cat._id,
    catKey: (cat.categoryName || `cat_${fallbackIndex + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_"),
    name: cat.categoryName || "Untitled Service",
    category: cat.groupCategory || "Appliance",
    groupCategory: cat.groupCategory || "Appliance",
    icon: cat.icon || "🔧",
    basePrice: Number(cat.baseDiagnosticAmount) || 0,
    baseDiagnosticAmount: Number(cat.baseDiagnosticAmount) || 0,
    estimatedMax: (Number(cat.baseDiagnosticAmount) || 250) * 4,
    isActive: cat.isVisible !== false,
    isVisible: cat.isVisible !== false,
    description: cat.description || "",
    subServices: Array.isArray(cat.subServices)
      ? cat.subServices.map((sub, sIdx) => ({
          id: sub._id || `sub_${fallbackIndex}_${sIdx}`,
          _id: sub._id,
          label: sub.title || "Standard Repair",
          title: sub.title || "Standard Repair",
          price: Number(sub.customerPrice) || 0,
          customerPrice: Number(sub.customerPrice) || 0,
          isActive: sub.isVisible !== false,
          isVisible: sub.isVisible !== false,
        }))
      : [],
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  };
}

/**
 * Normalizes a frontend UI service item into the backend ServiceCategory schema payload.
 */
export function mapUIToServiceCategoryPayload(srv) {
  return {
    categoryName: (srv.name || srv.categoryName || "").trim(),
    icon: (srv.icon || "🔧").trim(),
    groupCategory: (srv.category || srv.groupCategory || "Appliance").trim(),
    description: (srv.description || "").trim(),
    baseDiagnosticAmount: Math.max(0, Number(srv.basePrice ?? srv.baseDiagnosticAmount ?? 0)),
    subServices: Array.isArray(srv.subServices)
      ? srv.subServices
          .filter((sub) => (sub.label || sub.title || "").trim())
          .map((sub) => ({
            title: (sub.label || sub.title).trim(),
            customerPrice: Math.max(0, Number(sub.price ?? sub.customerPrice ?? 0)),
            isVisible: sub.isActive !== false && sub.isVisible !== false,
          }))
      : [],
  };
}

/**
 * Fetches all service categories from backend MongoDB.
 * Calls GET /api/service-categories
 */
export async function getAllServiceCategoriesApi(token = null) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "GET",
      SERVICE_CATEGORIES_API,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to fetch service categories");
    }

    const rawList = res.data?.data || [];
    const formatted = Array.isArray(rawList)
      ? rawList.map(mapServiceCategoryToUI)
      : [];

    return {
      success: true,
      data: formatted,
      raw: rawList,
      count: res.data?.count || formatted.length,
      message: res.data?.message || "Service categories retrieved successfully",
    };
  } catch (err) {
    console.error("Error fetching service categories:", err);
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch service categories",
      data: [],
    };
  }
}

/**
 * Creates a new service category in MongoDB.
 * Calls POST /api/service-categories
 * Payload: { categoryName, icon, groupCategory, description, baseDiagnosticAmount, subServices }
 */
export async function createServiceCategoryApi(categoryPayload, token = null) {
  try {
    const authToken = getAuthToken(token);
    const payload =
      categoryPayload.categoryName && categoryPayload.baseDiagnosticAmount !== undefined
        ? categoryPayload
        : mapUIToServiceCategoryPayload(categoryPayload);

    const res = await apiConnector(
      "POST",
      SERVICE_CATEGORIES_API,
      payload,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to create service category");
    }

    return {
      success: true,
      data: mapServiceCategoryToUI(res.data?.data),
      raw: res.data?.data,
      message: res.data?.message || "Service category created successfully",
    };
  } catch (err) {
    console.error("Error creating service category:", err);
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to create service category",
    };
  }
}

/**
 * Updates an existing service category's core details (name, icon, group, description, baseDiagnosticAmount).
 * Calls PATCH /api/service-categories/:categoryId
 */
export async function updateServiceCategoryApi(categoryId, updates, token = null) {
  try {
    const authToken = getAuthToken(token);
    const cleanUpdates = {};
    if (updates.categoryName !== undefined) cleanUpdates.categoryName = updates.categoryName;
    if (updates.name !== undefined && updates.categoryName === undefined) cleanUpdates.categoryName = updates.name;
    if (updates.icon !== undefined) cleanUpdates.icon = updates.icon;
    if (updates.groupCategory !== undefined) cleanUpdates.groupCategory = updates.groupCategory;
    if (updates.category !== undefined && updates.groupCategory === undefined) cleanUpdates.groupCategory = updates.category;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.baseDiagnosticAmount !== undefined) cleanUpdates.baseDiagnosticAmount = Number(updates.baseDiagnosticAmount);
    if (updates.basePrice !== undefined && updates.baseDiagnosticAmount === undefined) cleanUpdates.baseDiagnosticAmount = Number(updates.basePrice);

    const res = await apiConnector(
      "PATCH",
      `${SERVICE_CATEGORIES_API}/${categoryId}`,
      cleanUpdates,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to update service category");
    }

    return {
      success: true,
      data: mapServiceCategoryToUI(res.data?.data),
      raw: res.data?.data,
      message: res.data?.message || "Service category updated successfully",
    };
  } catch (err) {
    console.error("Error updating service category:", err);
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to update service category",
    };
  }
}

/**
 * Toggles a service category's customer visibility (shown/hidden).
 * Calls PATCH /api/service-categories/:categoryId/visibility
 */
export async function toggleCategoryVisibilityApi(categoryId, token = null) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "PATCH",
      `${SERVICE_CATEGORIES_API}/${categoryId}/visibility`,
      {},
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to toggle category visibility");
    }

    return {
      success: true,
      data: mapServiceCategoryToUI(res.data?.data),
      raw: res.data?.data,
      message: res.data?.message || "Category visibility updated successfully",
    };
  } catch (err) {
    console.error("Error toggling category visibility:", err);
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to change category visibility",
    };
  }
}

/**
 * Adds a new sub-service or updates an existing sub-service inside a category.
 * Calls POST /api/service-categories/:categoryId/sub-services
 * If subServiceId is provided: updates that sub-service.
 * If subServiceId is omitted: appends a new sub-service.
 */
export async function updateSubServiceApi(categoryId, subServiceData, token = null) {
  try {
    const authToken = getAuthToken(token);
    const payload = {};
    if (subServiceData.subServiceId) payload.subServiceId = subServiceData.subServiceId;
    if (subServiceData.id && !payload.subServiceId && /^[0-9a-fA-F]{24}$/.test(subServiceData.id)) {
      payload.subServiceId = subServiceData.id;
    }
    if (subServiceData.title !== undefined) payload.title = subServiceData.title;
    if (subServiceData.label !== undefined && payload.title === undefined) payload.title = subServiceData.label;
    if (subServiceData.customerPrice !== undefined) payload.customerPrice = Number(subServiceData.customerPrice);
    if (subServiceData.price !== undefined && payload.customerPrice === undefined) payload.customerPrice = Number(subServiceData.price);

    const res = await apiConnector(
      "POST",
      `${SERVICE_CATEGORIES_API}/${categoryId}/sub-services`,
      payload,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to add or update sub-service");
    }

    return {
      success: true,
      data: mapServiceCategoryToUI(res.data?.data),
      raw: res.data?.data,
      message: res.data?.message || "Sub-service saved successfully",
    };
  } catch (err) {
    console.error("Error updating sub-service:", err);
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to add or update sub-service",
    };
  }
}

/**
 * Toggles a sub-service's visibility (shown/hidden).
 * Calls PATCH /api/service-categories/:categoryId/sub-services/:subServiceId/visibility
 */
export async function toggleSubServiceVisibilityApi(categoryId, subServiceId, token = null) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "PATCH",
      `${SERVICE_CATEGORIES_API}/${categoryId}/sub-services/${subServiceId}/visibility`,
      {},
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to toggle sub-service visibility");
    }

    return {
      success: true,
      data: res.data?.data,
      message: res.data?.message || "Sub-service visibility updated successfully",
    };
  } catch (err) {
    console.error("Error toggling sub-service visibility:", err);
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to change sub-service visibility",
    };
  }
}

/**
 * Permanently deletes a service category from MongoDB.
 * Calls DELETE /api/service-categories/:categoryId
 */
export async function deleteServiceCategoryApi(categoryId, token = null) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "DELETE",
      `${SERVICE_CATEGORIES_API}/${categoryId}`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to delete service category");
    }

    return {
      success: true,
      message: res.data?.message || "Service category permanently deleted",
    };
  } catch (err) {
    console.error("Error deleting service category:", err);
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to delete service category",
    };
  }
}

/**
 * Permanently deletes a sub-service from a service category.
 * Calls DELETE /api/service-categories/:categoryId/sub-services/:subServiceId
 */
export async function deleteSubServiceApi(categoryId, subServiceId, token = null) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "DELETE",
      `${SERVICE_CATEGORIES_API}/${categoryId}/sub-services/${subServiceId}`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to delete sub-service");
    }

    return {
      success: true,
      data: mapServiceCategoryToUI(res.data?.data),
      raw: res.data?.data,
      message: res.data?.message || "Sub-service permanently deleted",
    };
  } catch (err) {
    console.error("Error deleting sub-service:", err);
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to delete sub-service",
    };
  }
}

