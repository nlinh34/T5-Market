document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra xem có thông tin user từ Google không
  const tempUserData = localStorage.getItem("tempUserData");
  if (!tempUserData) {
    // Nếu không có, chuyển về trang login
    window.location.href = "../login/login.html";
    return;
  }

  const phoneForm = document.getElementById("phoneForm");
  const errorMessage = document.getElementById("errorMessage");

  phoneForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const phone = document.getElementById("phone").value;
    const userData = JSON.parse(tempUserData);

    try {
      const response = await fetch("https://t5-market.onrender.com/auth/update-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          userId: userData.userId,
          phone: phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Cập nhật số điện thoại thất bại");
      }

      // Xóa dữ liệu tạm
      localStorage.removeItem("tempUserData");

      // Lưu token và thông tin user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Chuyển hướng đến trang chủ
      window.location.href = "../home/index.html";
    } catch (error) {
      errorMessage.textContent = error.message;
      console.error("Error:", error);
    }
  });
});
