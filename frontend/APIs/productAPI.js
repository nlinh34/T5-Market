import { apiCall } from "./utils/api.js";

export const ProductAPI = {
  getAllProducts: async () => {
    return await apiCall({ endpoint: "/products/approved" });
  },

  getPendingProducts: async () => {
    return await apiCall({ endpoint: "/products/pending" });
  },

  updateStatus: async (id) => {
    return await apiCall({
      endpoint: `/products/${id}/status`,
      method: "PATCH",
      data: { isApproved: true },
    });
  },

  getProduct: async (id) => {
    return await apiCall({ endpoint: `/products/${id}` });
  },

  createProduct: async (data) => {
    return await apiCall({
      endpoint: "/products",
      method: "POST",
      data,
    });
  },

  updateProduct: async (id, data) => {
    return await apiCall({
      endpoint: `/products/update/${id}`,
      method: "PUT",
      data,
    });
  },

  deleteProduct: async (id) => {
    return await apiCall({
      endpoint: `/products/delete/${id}`,
      method: "DELETE",
    });
  },
};
