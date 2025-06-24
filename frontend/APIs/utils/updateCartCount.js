export const updateCartCount = (count, isIncrement = false) => {
  try {
    // Lấy thông tin user từ localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.error("User not found in localStorage");
      return;
    }
    const user = JSON.parse(userStr);
    let currentCount;
    if (isIncrement) {
      // Nếu là tăng/giảm số lượng
      currentCount = parseInt(user.cartCount || "0");
      currentCount += count;
    } else {
      // Nếu là set số lượng mới
      currentCount = count;
    }
    // Đảm bảo cartCount không âm
    currentCount = Math.max(0, currentCount);
    // Cập nhật cartCount trong user object
    user.cartCount = currentCount;
    // Lưu lại user đã cập nhật vào localStorage
    localStorage.setItem("user", JSON.stringify(user));
    // Cập nhật UI
    const cartCountElement = document.querySelector(".cart-count");
    if (cartCountElement) {
      cartCountElement.textContent = currentCount;
    }
    // Dispatch event để các component khác có thể lắng nghe
    window.dispatchEvent(
      new CustomEvent("cartCountUpdated", {
        detail: { count: currentCount },
      })
    );
    // Xóa key cartCount riêng nếu có
    localStorage.removeItem("cartCount");
  } catch (error) {
    console.error("Error updating cart count:", error);
  }
};

export function saveVoucherInfo(voucherInfo) {
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
}

export function getVoucherInfo() {
  try {
    const voucherInfo = localStorage.getItem("cartVoucher");
    if (!voucherInfo) return null;
    const parsedInfo = JSON.parse(voucherInfo);
    return parsedInfo;
  } catch (error) {
    console.error("Error getting voucher info:", error);
    return null;
  }
}

export function clearVoucherInfo() {
  localStorage.removeItem("cartVoucher");
}
