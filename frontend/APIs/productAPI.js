import { apiCall } from "./utils/api.js";

export const ProductAPI = {
  // Lấy tất cả sản phẩm (không lọc trạng thái)
  getAllProducts: async () => {
    return await apiCall({ endpoint: "/products/get-all-products" });
  },

  // Lấy sản phẩm chờ duyệt
  getPendingProducts: async () => {
    return await apiCall({ endpoint: "/products/get-pending-products" });
  },

  // Lấy sản phẩm đã duyệt
  getApprovedProducts: async () => {
    return await apiCall({ endpoint: "/products/get-approved-products" });
  },

  // Lấy sản phẩm bị từ chối
  getRejectedProducts: async () => {
    return await apiCall({ endpoint: "/products/get-rejected-products" });
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id) => {
    return await apiCall({ endpoint: `/products/${id}` });
  },

  // Tạo sản phẩm mới
  createProduct: async (data) => {
    return await apiCall({
      endpoint: "/products",
      method: "POST",
      data,
    });
  },

  // Duyệt sản phẩm
  approveProduct: async (id) => {
    return await apiCall({
      endpoint: `/products/approve-product/${id}`,
      method: "PUT",
    });
  },

  // Từ chối sản phẩm
  rejectProduct: async (id, reason) => {
    return await apiCall({
      endpoint: `/products/reject-product/${id}`,
      method: "PUT",
      data: { rejectionReason: reason },
    });
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, data) => {
    return await apiCall({
      endpoint: `/products/${id}`,
      method: "PUT",
      data,
    });
  },

  // Xoá sản phẩm
  deleteProduct: async (id) => {
    return await apiCall({
      endpoint: `/products/${id}`,
      method: "DELETE",
    });
  },

  // Lấy sản phẩm theo shop ID và trạng thái 
  getProductsByShopId: async (shopId) => {
    return await apiCall({ endpoint: `/products/shop/${shopId}` });
  },

  getApprovedProductsByShopId: async (shopId) => {
    return await apiCall({ endpoint: `/products/shop/${shopId}/approved` });
  },

  getPendingProductsByShopId: async (shopId) => {
    return await apiCall({ endpoint: `/products/shop/${shopId}/pending` });
  },

  getRejectedProductsByShopId: async (shopId) => {
    return await apiCall({ endpoint: `/products/shop/${shopId}/rejected` });
  },
};
