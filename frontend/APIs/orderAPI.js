import { apiCall } from "./utils/api.js";

const OrderAPI = {
  // USER
  createOrder: async (orderData) => {
    try {
      const response = await apiCall({
        endpoint: "/order",
        method: "POST",
        data: orderData,
      });
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

  getUserOrders: async (status = null) => {
    try {
      let endpoint = "/order/get-order";
      if (status) {
        endpoint += `?status=${status}`;
      }
      const response = await apiCall({
        endpoint,
        method: "GET",
      });
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

  cancelOrder: async (orderId, cancelReason = null) => {
    try {
      const data = cancelReason ? { cancelReason } : {};
      const response = await apiCall({
        endpoint: `/order/${orderId}/cancel`,
        method: "PUT",
        data,
      });
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
  getAllOrders: async (status = null) => {
    try {
      let endpoint = "/order/get-all-orders";
      if (status) {
        endpoint += `?status=${status}`;
      }
      const response = await apiCall({
        endpoint,
        method: "GET",
      });
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

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await apiCall({
        endpoint: `/order/update-order-status/${orderId}`,
        method: "PUT",
        data: { status },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng",
      };
    }
  },
};

export default OrderAPI;
