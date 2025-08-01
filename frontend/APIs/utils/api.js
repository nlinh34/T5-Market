import { API_BASE_URL } from "../../config.js";


export const apiCall = async ({
  endpoint,
  method = "GET",
  data = null,
  customHeaders = {},
  expectedStatusCodes = [],
}) => {
  try {
    const token = localStorage.getItem("token");
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...customHeaders,
    });

    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }

    const config = {
      method,
      headers,
      mode: "cors",
      cache: "no-cache",
    };

    if (data && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {

      config.body = JSON.stringify(data);
    }

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${cleanEndpoint}`;

    console.log("Calling API: ", url);
    const response = await fetch(url, config);

    let responseData;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.error("❌ Server trả về không phải JSON:\n", text);
        throw new Error("Phản hồi không hợp lệ từ server.");
      }
    } catch (parseError) {
      console.error("❌ Lỗi khi parse JSON từ server:", parseError);
      throw new Error("Phản hồi từ server không phải JSON.");
    }
    if (!response.ok) {
      if (expectedStatusCodes.includes(response.status)) {
        return responseData;
      }
      throw new Error(responseData.error || responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;

  } catch (error) {
    if (error instanceof Error) {
      console.error("API call error message:", error.message);
    } else {
      console.error("API call unknown error:", error);
    }
    throw error;

  }
};
