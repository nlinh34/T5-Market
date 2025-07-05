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
  }
};
