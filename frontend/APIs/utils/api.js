const BASE_URL = "https://t5-market.onrender.com";

export const apiCall = async (endpoint, method = "GET", data = null) => {
  try {
    const token = localStorage.getItem("token");
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }

    const config = {
      method: method,
      headers: headers,
      mode: "cors",
      cache: "no-cache",
    };

    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      config.body = JSON.stringify(data);
    }

    // Đảm bảo endpoint bắt đầu bằng '/'
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${cleanEndpoint}`;

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};

// Helper function để test connection
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${BASE_URL}/test`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Test connection failed:", error);
    return false;
  }
};
