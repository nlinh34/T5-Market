export const API_BASE_URL =
    location.hostname === "localhost" || location.hostname === "127.0.0.1" ?
    "http://localhost:5500" :
    "https://t5-market.onrender.com"; // Production domain