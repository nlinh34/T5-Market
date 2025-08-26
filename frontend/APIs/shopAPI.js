import { apiCall } from "./utils/api.js";

export class ShopAPI {
  static async requestUpgradeToSeller(shopData) {
    return await apiCall({
      endpoint: "/shop",
      method: "POST",
      data: shopData,
      expectedStatusCodes: [200],
    });
  }

  static async getShopWithProducts(shopId) {
    return await apiCall({
      endpoint: `/shop/${shopId}/details-with-products`,
      method: "GET",
      expectedStatusCodes: [200],
    });
  }

  static async getMyShop() {
    return await apiCall({
      endpoint: '/shop/my-shop',
      method: 'GET',
      expectedStatusCodes: [200, 404]
    });
  }

  static async updateShopProfile(shopData) {
    return await apiCall({
        endpoint: '/shop/profile',
        method: 'PUT',
        data: shopData,
        expectedStatusCodes: [200]
    });
  }

  static async updateShopPolicies(policyData) {
    return await apiCall({
      endpoint: '/shop/policies',
      method: 'PUT',
      data: policyData,
      expectedStatusCodes: [200]
    });
  }

  // Staff Management APIs
  static async getShopStaff() {
    return await apiCall({
      endpoint: '/shop/my-shop/staff',
      method: 'GET',
      expectedStatusCodes: [200]
    });
  }

  static async addStaff(emailOrUsername) {
    return await apiCall({
      endpoint: '/shop/my-shop/staff',
      method: 'POST',
      data: { emailOrUsername },
      expectedStatusCodes: [201],
    });
  }

  static async createStaff(staffData) {
    return await apiCall({
        endpoint: '/shop/my-shop/staff/create',
        method: 'POST',
        data: staffData,
        expectedStatusCodes: [201],
    });
  }

  static async removeStaff(staffId) {
    return await apiCall({
      endpoint: `/shop/my-shop/staff/${staffId}`,
      method: 'DELETE',
      expectedStatusCodes: [200]
    });
  }

  static async updateStaffPermissions(staffId, permissions) {
    return await apiCall({
      endpoint: `/shop/my-shop/staff/${staffId}/permissions`,
      method: 'PUT',
      data: { permissions },
      expectedStatusCodes: [200]
    });
  }

  // Admin APIs
  static async getPendingShops() {
    return await apiCall({
      endpoint: '/shop/get-pending-shops',
      method: 'GET',
      expectedStatusCodes: [200]
    });
  }

  static async getFeaturedShops() {
    return await apiCall({
      endpoint: '/shop/featured',
      method: 'GET',
      expectedStatusCodes: [200]
    });
  }

  static async getApprovedShops() {
    return await apiCall({
      endpoint: '/shop/get-approved-shops',
      method: 'GET',
      expectedStatusCodes: [200]
    });
  }

  static async approveShop(shopId) {
    return await apiCall({
      endpoint: `/shop/approve-shop/${shopId}`,
      method: 'PUT',
      expectedStatusCodes: [200]
    });
  }

  static async rejectShop(shopId, reason) {
    return await apiCall({
      endpoint: `/shop/reject-shop/${shopId}`,
      method: 'PUT',
      data: { reason },
      expectedStatusCodes: [200]
    });
  }

  static async getShopRating(shopId) {
    return await apiCall({
      endpoint: `/shop/${shopId}/reviews`,
      method: 'GET',
      expectedStatusCodes: [200]
    });
  }

  static async getShopAnalytics(shopId, params = {}) {
    const qs = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiCall({
      endpoint: `/shop/my-shop/${shopId}/analytics${qs}`,
      method: 'GET',
      expectedStatusCodes: [200]
    });
  }
}
