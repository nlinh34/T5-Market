import { apiCall } from "./utils/api.js"

export const CategoryAPI = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    return apiCall({
      endpoint: "/categories/get-all",
      method: "GET"
    });
  },

  // Lấy danh mục theo ID
  getCategory: async (id) => {
    return apiCall({
      endpoint: `/categories/get/${id}`,
      method: "GET"
    });
  },

  // Tạo danh mục mới
  createCategory: async (categoryData) => {
    return apiCall({
      endpoint: "/categories/create",
      method: "POST",
      data: categoryData
    });
  },

  // Cập nhật danh mục
  updateCategory: async (id, categoryData) => {
    return apiCall({
      endpoint: `/categories/update/${id}`,
      method: "PUT",
      data: categoryData
    });
  },

  // Xóa danh mục
  deleteCategory: async (id) => {
    return apiCall({
      endpoint: `/categories/delete/${id}`,
      method: "DELETE"
    });
  }
};
