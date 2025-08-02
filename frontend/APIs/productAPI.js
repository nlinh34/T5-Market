import { apiCall } from "./utils/api.js";

export const ProductAPI = {

  // Lấy tất cả sản phẩm (không lọc trạng thái)
  getAllProducts: async () => {
    return await apiCall({ endpoint: "/products/get-all-products" });
  },

  getAllProductsByFilter: async ({ categoryIds, minPrice, maxPrice }) => {
    try {
      let endpoint = "/products/get-all-products";
      const queryParams = [];

      if (categoryIds && categoryIds.length > 0) {
        queryParams.push(`category=${categoryIds.join(",")}`);
      }
      if (minPrice) {
        queryParams.push(`minPrice=${minPrice}`);
      }
      if (maxPrice) {
        queryParams.push(`maxPrice=${maxPrice}`);
      }

      if (queryParams.length > 0) {
        endpoint += `?${queryParams.join("&")}`;
      }

      return await apiCall({
        endpoint,
      });
    } catch (error) {
      throw error;
    }
  },

  // Lấy sản phẩm chờ duyệt
  getPendingProducts: async () => {
    return await apiCall({ endpoint: "/products/get-pending-products" });
  },

  // Lấy sản phẩm đã duyệt
  getApprovedProducts: async (page = 1, limit = 15) => {
    return await apiCall({ endpoint: `/products/get-approved-products?page=${page}&limit=${limit}` });
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
      data: { status: "approved" },
    });
  },

  // Từ chối sản phẩm
  rejectProduct: async (id, reason) => {
    return await apiCall({
      endpoint: `/products/reject-product/${id}`,
      method: "PUT",
      data: {
        status: "rejected",
        rejectionReason: reason
      },
    });
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, data) => {
    return await apiCall({
      endpoint: `/products/${id}`,
      method: "PATCH",
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
    return await apiCall({ endpoint: `/products/by-shop/${shopId}` });
  },

  getApprovedProductsByShopId: async (shopId) => {
    return await apiCall({ endpoint: `/products/by-shop/${shopId}/approved` });
  },

  getPendingProductsByShopId: async (shopId) => {
    return await apiCall({ endpoint: `/products/by-shop/${shopId}/pending` });
  },

  getRejectedProductsByShopId: async (shopId) => {
    return await apiCall({ endpoint: `/products/by-shop/${shopId}/rejected` });
  },

  getProductsByShop: async (shopId, status = 'all', searchTerm = '', sortBy = 'createdAt-desc') => {
    let endpoint = `/products/by-shop/${shopId}`;
    const queryParams = new URLSearchParams();

    if (status && status !== 'all') {
      queryParams.append('status', status);
    }
    if (searchTerm) {
      queryParams.append('keyword', searchTerm);
    }
    if (sortBy) {
      queryParams.append('sortBy', sortBy);
    }

    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }

    return await apiCall({
      endpoint,
      method: 'GET',
      expectedStatusCodes: [200],
    });
  }
};
