import { apiConnector, BASE_URL } from "../apiConnector";

export const adminEndpoints = {
  USER_STATUS_UPDATE_API: BASE_URL + "/admin", // + /:userId/status
  GET_ALL_USERS_API: BASE_URL + "/admin/users",
};

const { USER_STATUS_UPDATE_API, GET_ALL_USERS_API } = adminEndpoints;

const getAuthToken = (token) =>
  token ||
  (typeof window !== "undefined"
    ? localStorage.getItem("mm_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken")
    : null);

export async function updateUserStatusApi(userId, status, token, durationDays = 7) {
  try {
    const authToken = getAuthToken(token);
    const cleanStatus = typeof status === "string" ? status.toLowerCase().trim() : status;

    const payload = { status: cleanStatus };
    if (cleanStatus === "suspended") {
      payload.durationDays = Number.isInteger(durationDays) && durationDays > 0 ? durationDays : 7;
    }

    const res = await apiConnector(
      "PATCH",
      `${USER_STATUS_UPDATE_API}/${userId}/status`,
      payload,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to update user status");
    }

    return {
      success: true,
      user: res.data.user,
      message: res.data.message || "User status updated successfully",
    };
  } catch (err) {
    console.error("Error updating user status:", err);

    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to update user status",
    };
  }
}

export async function getAllUsersApi(token, params = {}) {
  try {
    const authToken = getAuthToken(token);
    const page = params?.page || 1;
    const limit = params?.limit || 100;

    const queryParams = new URLSearchParams();
    if (page) queryParams.set("page", String(page));
    if (limit) queryParams.set("limit", String(limit));
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${GET_ALL_USERS_API}?${queryString}` : GET_ALL_USERS_API;

    const res = await apiConnector(
      "GET",
      endpoint,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to fetch users");
    }

    // Backend controller returns: { success: true, message: "...", pagination: { ... }, data: [users] }
    const rawUsers = res.data.data || res.data.users || [];
    const pagination = res.data.pagination || {
      currentPage: page,
      pageSize: limit,
      totalUsers: Array.isArray(rawUsers) ? rawUsers.length : 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };

    let users = Array.isArray(rawUsers) ? [...rawUsers] : [];

    // If caller requests fetchAll and multiple pages exist, retrieve remaining pages
    if (params?.fetchAll && pagination.totalPages > 1) {
      const pagePromises = [];
      for (let p = 2; p <= pagination.totalPages; p++) {
        pagePromises.push(
          apiConnector(
            "GET",
            `${GET_ALL_USERS_API}?page=${p}&limit=${limit}`,
            null,
            authToken ? { Authorization: `Bearer ${authToken}` } : {},
          )
            .then((r) => r.data?.data || r.data?.users || [])
            .catch(() => [])
        );
      }
      const additionalPages = await Promise.all(pagePromises);
      additionalPages.forEach((pageUsers) => {
        if (Array.isArray(pageUsers)) {
          users.push(...pageUsers);
        }
      });
    }

    return {
      success: true,
      users,
      pagination,
      count: pagination.totalUsers ?? users.length,
      message: res.data.message || "Users retrieved successfully",
    };
  } catch (err) {
    console.error("Error fetching users:", err);
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch users",
      users: [],
    };
  }
}

