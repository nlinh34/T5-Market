import { apiCall } from "./utils/api.js"; 

const favoriteAPI = {
  // Lấy danh sách sản phẩm yêu thích
  async getFavorites() {
    return apiCall({
      endpoint: "/favorites",
      method: "GET",
    });
  },

  // Thêm sản phẩm vào yêu thích
  async addFavorite(productId) {
    return apiCall({
      endpoint: `/favorites/add/${productId}`,
      method: "POST",
    });
  },

  // Bỏ sản phẩm khỏi yêu thích
  async removeFavorite(productId) {
    return apiCall({
      endpoint: `/favorites/remove/${productId}`,
      method: "DELETE",
    });
  },
};

export default favoriteAPI;
