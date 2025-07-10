import { apiCall } from "./utils/api.js";

export class ShopAPI {
  static async requestUpgradeToSeller(shopData) {
    return await apiCall({
      endpoint: "/api/shops",
      method: "POST",
      data: shopData,
      expectedStatusCodes: [200],
    });
  }

  static async getShopWithProducts(shopId) {
    return await apiCall({
      endpoint: `/api/shops/${shopId}/details-with-products`,
      method: "GET",
      expectedStatusCodes: [200],
    });
  }

  static async getMyShop() {
    return await apiCall({
      endpoint: '/api/shops/my-shop',
      method: 'GET',
      expectedStatusCodes: [200, 404]
    });
  }

  static async updateShopProfile(shopData) {
    return await apiCall({
        endpoint: '/api/shops/profile',
        method: 'PUT',
        data: shopData,
        expectedStatusCodes: [200]
    });
  }

  static async updateShopPolicies(policyData) {
    return await apiCall({
      endpoint: '/api/shops/policies',
      method: 'PUT',
      data: policyData,
      expectedStatusCodes: [200]
    });
  }

  // Staff Management APIs
  static async getShopStaff() {
    return await apiCall({
      endpoint: '/api/shops/my-shop/staff',
      method: 'GET',
      expectedStatusCodes: [200]
    });
  }

  static async addStaff(emailOrUsername) {
    return await apiCall({
      endpoint: '/api/shops/my-shop/staff',
      method: 'POST',
      data: { emailOrUsername },
      expectedStatusCodes: [201],
    });
  }

  static async createStaff(staffData) {
    return await apiCall({
        endpoint: '/api/shops/my-shop/staff/create',
        method: 'POST',
        data: staffData,
        expectedStatusCodes: [201],
    });
  }

  static async removeStaff(staffId) {
    return await apiCall({
      endpoint: `/api/shops/my-shop/staff/${staffId}`,
      method: 'DELETE',
      expectedStatusCodes: [200]
    });
  }

  static async updateStaffPermissions(staffId, permissions) {
    return await apiCall({
      endpoint: `/api/shops/my-shop/staff/${staffId}/permissions`,
      method: 'PUT',
      data: { permissions },
      expectedStatusCodes: [200]
    });
  }

  // Admin APIs
  static async getPendingShops() {
    return await apiCall({
      endpoint: '/api/shops/get-pending-shops',
      method: 'GET',
      expectedStatusCodes: [200]
    });
  }

  static async getApprovedShops() {
    return await apiCall({
      endpoint: '/api/shops/get-approved-shops',
      method: 'GET',
      expectedStatusCodes: [200]
    });
  }

  static async approveShop(shopId) {
    return await apiCall({
      endpoint: `/api/shops/approve-shop/${shopId}`,
      method: 'PUT',
      expectedStatusCodes: [200]
    });
  }

  static async rejectShop(shopId, reason) {
    return await apiCall({
      endpoint: `/api/shops/reject-shop/${shopId}`,
      method: 'PUT',
      data: { reason },
      expectedStatusCodes: [200]
    });
  }
}
