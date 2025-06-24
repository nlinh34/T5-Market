document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Lấy giá trị từ form
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMessage = document.getElementById("errorMessage");

    // Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      errorMessage.textContent = "Mật khẩu nhập lại không khớp!";
      return;
    }

    try {
      const response = await fetch("https://t5-market.onrender.com/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Đăng ký thất bại");
      }

      // Hiển thị toast thành công
      showToast("Đăng ký thành công!");

      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        window.location.href = "../login/login.html";
      }, 2000);
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });

// Thêm CSS cho thông báo lỗi
const style = document.createElement("style");
style.textContent += `
  .toast-message {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #4caf50;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: 1000;
  }

  .toast-message.show {
    opacity: 1;
    transform: translateY(0);
  }
`;

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = "toast-message";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100); // delay một chút để transition hoạt động

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300); // gỡ khỏi DOM sau khi ẩn
  }, 2000); // toast tồn tại 2 giây
}

document.head.appendChild(style);
