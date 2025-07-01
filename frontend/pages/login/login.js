const API_BASE_URL = "https://t5-market.onrender.com"; // <- URL backend chính xác của bạn

// Xử lý đăng nhập thông thường
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const userIdentifier = document.getElementById("userIdentifier").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    try {
      const isEmail = userIdentifier.includes("@");

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        // Sửa lại endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          ...(isEmail ? { email: userIdentifier } : { phone: userIdentifier }),
          password,
          rememberMe: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || "Đăng nhập thất bại");
      }

      // Lưu token và thông tin user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Chuyển hướng đến trang chủ
      window.location.href = "/index.html";
    } catch (error) {
      errorMessage.textContent = error.message;
      console.error("Error:", error);
    }
  });

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
    const result = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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
    window.location.href = "/index.html";
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
