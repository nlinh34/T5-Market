import { apiCall } from "./utils/api.js";

export const FaqAPI = {
  getAllFAQs: async () => {
    try {
      return await apiCall("faqs/get-all-faqs");
    } catch (error) {
      console.error("Error in getAllFAQs:", error);
      throw error;
    }
  },
  getFAQ: async (id) => {
    try {
      return await apiCall(`faqs/get-faq/${id}`);
    } catch (error) {
      console.error("Error in getFAQ:", error);
      throw error;
    }
  },
  createFAQ: async (data) => {
    try {
      return await apiCall("faqs/create", "POST", data);
    } catch (error) {
      console.error("Error in createFAQ:", error);
      throw error;
    }
  },
  updateFAQ: async (id, data) => {
    try {
      return await apiCall(`faqs/update/${id}`, "PUT", data);
    } catch (error) {
      console.error("Error in updateFAQ:", error);
      throw error;
    }
  },
  deleteFAQ: async (id) => {
    try {
      return await apiCall(`faqs/delete/${id}`, "DELETE");
    } catch (error) {
      console.error("Error in deleteFAQ:", error);
      throw error;
    }
  },
};
