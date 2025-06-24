import { apiCall } from "./utils/api.js";

export const BlogAPI = {
  getAllBlogs: async () => {
    try {
      return await apiCall("blogs/get-all-blogs");
    } catch (error) {
      console.error("Error in getAllBlogs:", error);
      throw error;
    }
  },
  getBlog: async (id) => {
    try {
      return await apiCall(`blogs/get-blog/${id}`);
    } catch (error) {
      console.error("Error in getBlog:", error);
      throw error;
    }
  },
  createBlog: async (data) => {
    try {
      return await apiCall("blogs/create", "POST", data);
    } catch (error) {
      console.error("Error in createBlog:", error);
      throw error;
    }
  },
  updateBlog: async (id, data) => {
    try {
      return await apiCall(`blogs/update/${id}`, "PUT", data);
    } catch (error) {
      console.error("Error in updateBlog:", error);
      throw error;
    }
  },
  deleteBlog: async (id) => {
    try {
      return await apiCall(`blogs/delete/${id}`, "DELETE");
    } catch (error) {
      console.error("Error in deleteBlog:", error);
      throw error;
    }
  },
};
