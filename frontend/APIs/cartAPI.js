import { apiCall } from "./utils/api.js";

class CartAPI {
  // Lấy thông tin giỏ hàng
  static async getCart() {
    return await apiCall("/cart", "GET");
  }

  // Thêm sản phẩm vào giỏ hàng
  static async addProduct(product_id, quantity = 1) {
    try {
      const response = await apiCall("/cart/add-product", "POST", {
        product_id,
        quantity,
      });
      // Đảm bảo trả về đúng format response
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Add product error:", error);
      return {
        success: false,
        error: error.message || "Không thể thêm vào giỏ hàng",
      };
    }
  }

  // Thêm combo vào giỏ hàng
  static async addCombo(combo_id, quantity = 1) {
    try {
      const response = await apiCall("/cart/add-combo", "POST", {
        combo_id,
        quantity,
      });
      // Đảm bảo trả về đúng format response
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Add product error:", error);
      return {
        success: false,
        error: error.message || "Không thể thêm vào giỏ hàng",
      };
    }
  }

  // Cập nhật số lượng sản phẩm
  static async updateQuantity(cartItemId, quantity) {
    try {
      return await apiCall("/cart/update-product-quantity", "PUT", {
        cart_item_id: cartItemId,
        quantity,
      });
    } catch (error) {
      console.error("Update quantity error:", error);
      throw error;
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  static async removeProduct(cartItemId) {
    try {
      const response = await apiCall(
        `/cart/remove-product/${cartItemId}`,
        "DELETE"
      );
      return response;
    } catch (error) {
      console.error("Remove product error:", error);
      throw error;
    }
  }

  // Áp dụng voucher
  static async addVoucher(voucher_code) {
    try {
      const response = await apiCall("/cart/add-voucher", "POST", {
        voucher_code,
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Add voucher error:", error);
      // Throw error message từ API response
      throw error.error || "Voucher không hợp lệ hoặc đã hết hạn!";
    }
  }

  // Áp dụng voucher bằng ID
  static async addVoucherById(voucher_id) {
    try {
      const response = await apiCall("/cart/add-voucher", "POST", {
        voucher_id,
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Add voucher error:", error);
      return {
        success: false,
        error: error.message || "Không thể áp dụng voucher",
      };
    }
  }

  // Xóa toàn bộ giỏ hàng
  static async clearCart() {
    try {
      const response = await apiCall("/cart/clear", "DELETE");
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Clear cart error:", error);
      return {
        success: false,
        error: error.message || "Không thể xóa giỏ hàng",
      };
    }
  }
}

export default CartAPI;
