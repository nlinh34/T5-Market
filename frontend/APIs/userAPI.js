import { apiCall } from "./utils/api.js";

export const UserAPI = {
  getAllUsers: async (page = 1, limit = 10) => {
    return await apiCall({
      endpoint: `/auth/all-users?page=${page}&limit=${limit}`,
      method: "GET",
    });
  },

  deleteUser: async (userId) => {
    return await apiCall({
      endpoint: `/auth/user/${userId}`,
      method: "DELETE",
    });
  },

   // 👇 Thêm API cập nhật trạng thái duyệt
  updateUserStatus: async (userId, status) => {
    return await apiCall({
      endpoint: `/auth/user/${userId}/status`,
      method: "PATCH",
      data: { status }, // status: 'approve' | 'reject'
    });
  },

  getCurrentUser: async () => {
    return await apiCall({
      endpoint: `/auth/current-user`,
      method: "GET",
    });
  },

  updateProfile: async (userData) => {
    return await apiCall({
      endpoint: `/auth/profile`,
      method: "PUT",
      data: userData,
    });
  },

  changePassword: async (passwordData) => {
    return await apiCall({
      endpoint: `/auth/change-password`,
      method: "PATCH",
      data: passwordData,
    });
  },
};
