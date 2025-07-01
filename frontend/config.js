export const API_BASE_URL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5000"
    : "https://t5-market.vercel.app"; // Thay bằng domain backend bạn đã deploy (Railway/Render/Vercel)
