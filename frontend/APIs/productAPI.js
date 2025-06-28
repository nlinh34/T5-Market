import { apiCall } from "./utils/api.js";

export const ProductAPI = {
  // ✅ Lấy danh sách sản phẩm ĐÃ duyệt
  getAllProducts: async () => {
    try {
      return await apiCall("products/approved");
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      throw error;
    }
  },

  // ✅ Lấy danh sách sản phẩm CHƯA duyệt (status: false)
  getPendingProducts: async () => {
    try {
      return await apiCall("products/pending");
    } catch (error) {
      console.error("Error in getPendingProducts:", error);
      throw error;
    }
  },

  // ✅ Duyệt sản phẩm (cập nhật status thành true)
  updateStatus: async (id) => {
    try {
      return await apiCall(`products/${id}/status`, "PATCH", { isApproved: true }, true);
    } catch (error) {
      console.error("Error in approveProduct:", error);
      throw error;
    }
  },

  // ✅ Lấy chi tiết 1 sản phẩm
  getProduct: async (id) => {
    try {
      return await apiCall(`products/${id}`);
    } catch (error) {
      console.error("Error in getProduct:", error);
      throw error;
    }
  },

  // ✅ Tạo sản phẩm mới
  createProduct: async (data) => {
    try {
      return await apiCall("products/", "POST", data);
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw error;
    }
  },

  // ✅ Cập nhật sản phẩm
  updateProduct: async (id, data) => {
    try {
      return await apiCall(`products/update/${id}`, "PUT", data);
    } catch (error) {
      console.error("Error in updateProduct:", error);
      throw error;
    }
  },

  // ✅ Xoá sản phẩm
  deleteProduct: async (id) => {
    try {
      return await apiCall(`products/delete/${id}`, "DELETE");
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      throw error;
    }
  },
};
