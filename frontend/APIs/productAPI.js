import { apiCall } from "./utils/api.js";

export const ProductAPI = {

  getAllProducts: async () => {
    return await apiCall({ endpoint: "/products/get-all-products" });
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
  },

  getPriceRange: async () => {
    return await apiCall({
      endpoint: "/products/price-range",
      method: "GET",
    });
  },
  
  getAllProductsByFilter: async ({ category, minPrice, maxPrice, page = 1, limit = 15 }) => {
    const queryParams = [];

    // CHỈ PUSH nếu category là mảng và có ít nhất 1 ObjectId hợp lệ
    if (Array.isArray(category) && category.length > 0) {
      const validCategoryIds = category.filter(id => /^[a-f\d]{24}$/i.test(id));
      if (validCategoryIds.length > 0) {
        queryParams.push(`category=${validCategoryIds.join(",")}`);
      }
    }

    if (typeof minPrice !== "undefined") queryParams.push(`minPrice=${minPrice}`);
    if (typeof maxPrice !== "undefined") queryParams.push(`maxPrice=${maxPrice}`);

    if (page) queryParams.push(`page=${page}`);
    if (limit) queryParams.push(`limit=${limit}`);

    const endpoint = `/products/filter?${queryParams.join("&")}`;
    return await apiCall({ endpoint });
  }
};
