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

  deleteUser: async (userId) => {
  try {
    const token = localStorage.getItem("token"); // hoặc sessionStorage, tùy bạn lưu ở đâu
    const res = await fetch(`/auth/user/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Thêm token vào header
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Xóa người dùng thất bại");
    }

    return await res.json();
  } catch (error) {
    console.error("Lỗi khi gọi API xóa người dùng:", error);
    throw error;
  }
},


};

