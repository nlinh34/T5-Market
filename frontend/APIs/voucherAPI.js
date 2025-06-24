import { apiCall } from "./utils/api.js";

export const VoucherAPI = {
  getAllVouchers: async () => {
    try {
      return await apiCall("vouchers/get-all-vouchers");
    } catch (error) {
      console.error("Error in getAllVouchers:", error);
      throw error;
    }
  },
  getVoucher: async (id) => {
    try {
      return await apiCall(`vouchers/get-voucher/${id}`);
    } catch (error) {
      console.error("Error in getVoucher:", error);
      throw error;
    }
  },
  createVoucher: async (data) => {
    try {
      return await apiCall("vouchers/create", "POST", data);
    } catch (error) {
      console.error("Error in createVoucher:", error);
      throw error;
    }
  },
  updateVoucher: async (id, data) => {
    try {
      return await apiCall(`vouchers/update/${id}`, "PUT", data);
    } catch (error) {
      console.error("Error in updateVoucher:", error);
      throw error;
    }
  },
  deleteVoucher: async (id) => {
    try {
      return await apiCall(`vouchers/delete/${id}`, "DELETE");
    } catch (error) {
      console.error("Error in deleteVoucher:", error);
      throw error;
    }
  },
};
