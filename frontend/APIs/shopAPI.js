import { apiCall } from "./utils/api.js";

export const ShopAPI = {
  getPendingShops: async (page = 1, limit = 10) => {
    return await apiCall({
      endpoint: `/shop/get-pending-shops?page=${page}&limit=${limit}`,
      method: "GET",
    });
  },
  // Gọi API duyệt cửa hàng
  approveShop: async (shopId) => {
    return await apiCall({
      endpoint: `/shop/approve-shop/${shopId}`,
      method: "PUT",
    });
  },

  // Gọi API từ chối cửa hàng
  rejectShop: async (shopId) => {
    return await apiCall({
      endpoint: `/shop/reject-shop/${shopId}`,
      method: "PUT",
    });
  },

  /**
   * Gửi yêu cầu đăng ký một cửa hàng mới.
   * @param {object} shopData - Dữ liệu của cửa hàng cần đăng ký.
   * @returns {Promise<object>} - Promise giải quyết với kết quả từ API.
   */
  registerShop: async (shopData) => {
    return await apiCall({
      endpoint: "/shop",
      method: "POST",
      data: shopData,
    });
  },

  getMyShop: async () => {
    return await apiCall({
      endpoint: "/shop/my-shop",
      method: "GET",
      expectedStatusCodes: [404],
    });
  },

  updateShopProfile: async (shopData) => {
    return await apiCall({
      endpoint: "/shop/profile",
      method: "PUT",
      data: shopData,
    });
  },

  updateShopPolicies: async (policiesData) => {
    return await apiCall({
      endpoint: "/shop/policies",
      method: "PUT",
      data: policiesData,
    });
  },
};
