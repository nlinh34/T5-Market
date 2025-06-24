// success.js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  try {
    // Xoá từng sản phẩm khỏi giỏ hàng
    const res = await fetch("https://t5-market.onrender.com/cart/get-current", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      for (const item of data.data) {
        await fetch(`https://t5-market.onrender.com/cart/delete/${item.product_id._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    // Optional: có thể hiển thị đơn hàng ở đây từ localStorage
    const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));
    console.log("Đơn hàng vừa tạo:", lastOrder);

  } catch (err) {
    console.error("Lỗi xoá giỏ hàng sau khi đặt:", err);
  }
});
