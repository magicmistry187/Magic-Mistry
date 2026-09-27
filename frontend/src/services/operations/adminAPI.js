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

export async function updateUserStatusApi(userId, status, token) {
  try {
    const authToken = getAuthToken(token);
    const cleanStatus = typeof status === "string" ? status.toLowerCase().trim() : status;

    const res = await apiConnector(
      "PATCH",
      `${USER_STATUS_UPDATE_API}/${userId}/status`,
      { status: cleanStatus },
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

export async function getAllUsersApi(token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      "GET",
      GET_ALL_USERS_API,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {},
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to fetch users");
    }

    return {
      success: true,
      users: res.data.users || [],
      count: res.data.count || res.data.users?.length || 0,
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

