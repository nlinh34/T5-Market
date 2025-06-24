// frontend/APIs/utils/cartStorage.js
import { apiCall } from "./api.js";

export const CartStorage = {
  getCartCount() {
    return parseInt(localStorage.getItem("cartCount") || "0");
  },

  setCartCount(count) {
    localStorage.setItem("cartCount", count.toString());
    // Trigger event để update UI
    window.dispatchEvent(new CustomEvent("cartCountUpdated"));
  },

  incrementCartCount(amount = 1) {
    const currentCount = this.getCartCount();
    this.setCartCount(currentCount + amount);
  },

  decrementCartCount(amount = 1) {
    const currentCount = this.getCartCount();
    this.setCartCount(Math.max(0, currentCount - amount));
  },

  // Sync với server
  async syncCartCount() {
    try {
      // Sử dụng apiCall thay vì fetch trực tiếp
      const result = await apiCall("/cart", "GET");

      if (result.success) {
        const serverCount = result.cart.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        this.setCartCount(serverCount);
      }
    } catch (error) {
      console.error("Error syncing cart count:", error);
    }
  },

  // Reset cart count (dùng khi logout hoặc checkout)
  resetCartCount() {
    this.setCartCount(0);
  },

  // Lưu thông tin voucher
  saveVoucherInfo(voucherInfo) {
    try {
      // Kiểm tra dữ liệu trước khi lưu
      if (!voucherInfo || !voucherInfo.voucherInfo) {
        console.error("Invalid voucher data:", voucherInfo);
        return;
      }
      const voucherData = {
        productSubtotal: voucherInfo.productSubtotal || 0,
        comboSubtotal: voucherInfo.comboSubtotal || 0,
        discountType: voucherInfo.discountType || "",
        discountValue: voucherInfo.discountValue || 0,
        discountAmount: voucherInfo.discountAmount || 0,
        finalAmount: voucherInfo.finalAmount || 0,
        voucherInfo: {
          code: voucherInfo.voucherInfo.code || "",
          name: voucherInfo.voucherInfo.name || "",
          description: voucherInfo.voucherInfo.description || "",
        },
      };
      localStorage.setItem("cartVoucher", JSON.stringify(voucherData));
    } catch (error) {
      console.error("Error saving voucher info:", error);
    }
  },

  // Lấy thông tin voucher
  getVoucherInfo() {
    try {
      const voucherInfo = localStorage.getItem("cartVoucher");
      if (!voucherInfo) return null;
      const parsedInfo = JSON.parse(voucherInfo);
      return parsedInfo;
    } catch (error) {
      console.error("Error getting voucher info:", error);
      return null;
    }
  },

  // Xóa thông tin voucher
  clearVoucherInfo() {
    localStorage.removeItem("cartVoucher");
  },
};
