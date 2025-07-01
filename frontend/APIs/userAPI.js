import { apiCall } from "./utils/api.js";

export const UserAPI = {
  getAllUsers: async (page = 1, limit = 10) => {
    try {
      const result = await apiCall(`/auth/all-users?page=${page}&limit=${limit}`);
      return result;
    } catch (error) {
      throw new Error("Lỗi phân quyền hoặc không thể load dữ liệu.");
    }
  },
};

