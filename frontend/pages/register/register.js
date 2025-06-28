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
      const response = await fetch("http://127.0.0.1:5000/auth/sign-up", {
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

// Khởi tạo Google Sign-In
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id:
      "217304877915-ttuusm6c4fl8866mukanr82iuu3sitev.apps.googleusercontent.com", // Thay bằng client ID của bạn
    callback: handleGoogleSignIn,
    auto_select: false, // Ngăn không cho tự động hiển thị popup
    cancel_on_tap_outside: true,
  });
}

// Xử lý đăng nhập Google
async function handleGoogleSignIn(response) {
  try {
    const result = await fetch("http://127.0.0.1:5000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: "http://127.0.0.1:5500",
      },
      mode: "cors",
      credentials: "include",
      body: JSON.stringify({
        credential: response.credential,
      }),
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error || "Đăng nhập Google thất bại");
    }

    // Kiểm tra xem user có số điện thoại chưa
    if (!data.user.phone) {
      // Lưu thông tin tạm thời
      localStorage.setItem(
        "tempUserData",
        JSON.stringify({
          userId: data.user._id,
          email: data.user.email,
          fullName: data.user.fullName,
        })
      );

      // Chuyển đến trang xác thực số điện thoại
      window.location.href = "../phone-verify/phone-verify.html";
      return;
    }

    // Lưu token và thông tin user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Chuyển hướng đến trang chủ
    window.location.href = "/frontend/index.html";
  } catch (error) {
    document.getElementById("errorMessage").textContent = error.message;
    console.error("Google Sign-In Error:", error);
  }
}

// Xử lý nút Google tùy chỉnh
document.getElementById("googleSignIn").addEventListener("click", function (e) {
  e.preventDefault();
  // Kích hoạt flow đăng nhập Google khi nút tùy chỉnh được nhấp
  google.accounts.id.prompt();
});

// Xử lý nút Facebook
document.querySelector(".facebook").addEventListener("click", function (e) {
  e.preventDefault();
  alert("Tính năng đang được phát triển!");
});

// Khởi tạo Google Sign-In khi trang load xong
window.onload = initializeGoogleSignIn;
