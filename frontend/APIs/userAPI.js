import { apiCall } from "./utils/api.js";

export const UserAPI = {
  getAllUsers: async () => {
    try {
      return await apiCall("/auth/all-users");
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw error;
    }
  },
};
