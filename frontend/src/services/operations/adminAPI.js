import { apiConnector, BASE_URL } from "../apiConnector";

export const adminEndpoints = {
  USER_STATUS_UPDATE_API: BASE_URL + "/admin", // + /:userId/status
};

const { USER_STATUS_UPDATE_API } = adminEndpoints;

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

    const res = await apiConnector(
      "PATCH",
      `${USER_STATUS_UPDATE_API}/${userId}/status`,
      { status },
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
