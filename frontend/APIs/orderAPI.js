import { apiCall } from "./utils/api.js";

export const OrderAPI = {
  baseURL: "https://t5-market.onrender.com/order",

  // USER
  createOrder: async (orderData) => {
    try {
      const response = await apiCall("/order/create", "POST", orderData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error in createOrder:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi tạo đơn hàng",
      };
    }
  },

  // Lấy danh sách đơn hàng của người dùng hiện tại
  getUserOrders: async (status = null) => {
    try {
      let url = "/order/get-order";
      if (status) {
        url += `?status=${status}`;
      }
      const response = await apiCall(url, "GET");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi lấy danh sách đơn hàng",
      };
    }
  },
  // Hủy đơn hàng
  cancelOrder: async (orderId, cancelReason = null) => {
    try {
      const body = cancelReason ? { cancelReason } : {};
      const response = await apiCall(`/order/${orderId}/cancel`, "PUT", body);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error in cancelOrder:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi hủy đơn hàng",
      };
    }
  },

  // ADMIN
  // Chỉ dành cho Admin: Lấy tất cả đơn hàng
  getAllOrders: async (status = null) => {
    try {
      let url = "/order/get-all-orders";
      if (status) {
        url += `?status=${status}`;
      }
      const response = await apiCall(url, "GET");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi lấy tất cả đơn hàng",
      };
    }
  },

  // Chỉ dành cho Admin: Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await apiCall(
        `/order/update-order-status/${orderId}`,
        "PUT",
        {
          status,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      return {
        success: false,
        error:
          error.message || "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng",
      };
    }
  },
};

export default OrderAPI;
