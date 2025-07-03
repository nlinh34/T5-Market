import { apiCall } from "./utils/api.js"

export const CategoryAPI = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    try {
      return await apiCall({
        endpoint: "/categories/get-all",
        method: "GET" 
      }); 
    } catch (error) {
      console.error("Error in getAllCategories:", error);
      throw error;
    }
  },

  // Lấy danh mục theo ID
  getCategory: async (id) => {
    try {
      return await apiCall(`/categories/get/${id}`, "GET"); // ✅ đã sửa
    } catch (error) {
      console.error("Error in getCategory:", error);
      throw error;
    }
  },

  // Tạo danh mục mới
  createCategory: async (categoryData) => {
    try {
      return await apiCall("/categories/create", "POST", categoryData);
    } catch (error) {
      console.error("Error in createCategory:", error);
      throw error;
    }
  },

  // Sửa danh mục
  updateCategory: async (id, categoryData) => {
    try {
      return await apiCall(`/categories/update/${id}`, "PUT", categoryData);
    } catch (error) {
      console.error("Error in updateCategory:", error);
      throw error;
    }
  },

  // Xóa danh mục
  deleteCategory: async (id) => {
    try {
      return await apiCall(`/categories/delete/${id}`, "DELETE");
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      throw error;
    }
  },
};
