import { apiCall } from "./utils/api.js";

export const ReviewAPI = {
  // Gửi đánh giá mới
  createReview: async (reviewData) => {
    return await apiCall({
      endpoint: `/reviews`,
      method: "POST",
      data: reviewData,
    });
  },

  // Lấy tất cả đánh giá theo productId
  getReviewsByProduct: async (productId) => {
    return await apiCall({
      endpoint: `/reviews/${productId}`,
      method: "GET",
    });
  },

  // Lấy đánh giá theo rating cụ thể nếu bạn muốn filter
  getReviewsByProductAndRating: async (productId, rating) => {
    return await apiCall({
      endpoint: `/reviews/${productId}?rating=${rating}`,
      method: "GET",
    });
  },

  getReviewedProductsByOrder: async (orderId) => {
    return await apiCall({
      endpoint: `/reviews/${orderId}/reviewed`,
      method: "GET",
    });
  },
};
