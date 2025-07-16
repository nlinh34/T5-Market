import { apiCall } from "./utils/api.js";

export class ProductAPI {
  // Lấy tất cả sản phẩm (không lọc trạng thái)
  static async getAllProducts() {
    return await apiCall({ endpoint: "/products/get-all-products" });
  }

  // Lấy sản phẩm chờ duyệt
  static async getPendingProducts() {
    return await apiCall({ endpoint: "/products/get-pending-products" });
  }

  // Lấy sản phẩm đã duyệt
  static async getApprovedProducts() {
    return await apiCall({ endpoint: "/products/get-approved-products" });
  }

  // Lấy sản phẩm bị từ chối
  static async getRejectedProducts() {
    return await apiCall({ endpoint: "/products/get-rejected-products" });
  }

  // Lấy sản phẩm theo ID
  static async getProductById(id) {
    return await apiCall({ endpoint: `/products/${id}` });
  }

  // Tạo sản phẩm mới
  static async createProduct(data) {
    return await apiCall({
      endpoint: "/products",
      method: "POST",
      data,
    });
  }

  // Duyệt sản phẩm
  static async approveProduct(id) {
    return await apiCall({
      endpoint: `/products/approve-product/${id}`,
      method: "PUT",
      data: { status: "approved" },
    });
  }

  // Từ chối sản phẩm
  static async rejectProduct(id, reason) {
    return await apiCall({
      endpoint: `/products/reject-product/${id}`,
      method: "PUT",
      data: { 
        status: "rejected",
        rejectionReason: reason },
    });
  }

  // Cập nhật sản phẩm
  static async updateProduct(id, data) {
    return await apiCall({
      endpoint: `/products/${id}`,
      method: "PATCH",
      data,
    });
  }

  // Xoá sản phẩm
  static async deleteProduct(productId) {
    return await apiCall({
      endpoint: `/products/${productId}`,
      method: 'DELETE',
      expectedStatusCodes: [200],
    });
  }

  // Lấy sản phẩm theo shop ID và trạng thái 
  static async getProductsByShopId(shopId) {
    return await apiCall({ endpoint: `/products/shop/${shopId}` });
  }

  static async getApprovedProductsByShopId(shopId) {
    return await apiCall({ endpoint: `/products/shop/${shopId}/approved` });
  }

  static async getPendingProductsByShopId(shopId) {
    return await apiCall({ endpoint: `/products/shop/${shopId}/pending` });
  }

  static async getRejectedProductsByShopId(shopId) {
    return await apiCall({ endpoint: `/products/shop/${shopId}/rejected` });
  }

  static async getProductsByShop(shopId, status = 'all') {
    let endpoint = `/products/by-shop/${shopId}`;
    if (status && status !== 'all') {
      endpoint += `/${status}`;
    }
    return await apiCall({
      endpoint,
      method: 'GET',
      expectedStatusCodes: [200],
    });
  }
}
