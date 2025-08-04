import { apiCall } from "./utils/api.js";
const CartAPI = {
  getCart: async () => {
    try {
      const res = await apiCall({
        endpoint: "/cart",
        method: "GET",
      });

      if (res.success && res.cart) {
        return res;
      } else {
        console.warn("⚠️ Không nhận được cart từ API");
        return { cart: { items: [], total: 0 } };
      }
    } catch (err) {
      console.error("❌ Lỗi trong CartAPI.getCart:", err);
      return { cart: { items: [], total: 0 } };
    }
  },

  addToCart: async (productId, quantity) => {
  return await apiCall({
    endpoint: "/cart/add",
    method: "POST",
    data: { product: productId, quantity },
  });
},

  updateQuantity: async (productId, quantity) => {
    return await apiCall({
      endpoint: "/cart/update",
      method: "PATCH",
      data: { productId, quantity },
    });
  },


  removeFromCart: async (productId) => {
    return await apiCall({
      endpoint: `/cart/${productId}`,
      method: "DELETE",
    });
  },
};

export default CartAPI;
