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

      const response = await fetch("https://t5-market.onrender.com/auth/sign-in", {
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
        throw new Error(data.error || "Đăng nhập thất bại");
      }

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

// Khởi tạo Google Sign-In
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id:
      "217304877915-ttuusm6c4fl8866mukanr82iuu3sitev.apps.googleusercontent.com", // Thay bằng client ID của bạn
    callback: handleGoogleSignIn,
  });

  google.accounts.id.renderButton(document.getElementById("googleSignIn"), {
    type: "icon", // standard hoặc icon
    longtitle: true,
    theme: "filled_blue", // filled_blue hoặc outline
    size: "large", // large hoặc medium
    text: "", // "signin_with" hoặc "continue_with"
    shape: "rectangular", // rectangular hoặc pill
    logo_alignment: "left", // left hoặc center
    locale: "vi",
  });
}

// Xử lý đăng nhập Google
async function handleGoogleSignIn(response) {
  try {
    const result = await fetch("https://t5-market.onrender.com/auth/google", {
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
    window.location.href = "../home/index.html";
  } catch (error) {
    document.getElementById("errorMessage").textContent = error.message;
    console.error("Google Sign-In Error:", error);
  }
}

// Xử lý nút Facebook
document.querySelector(".facebook").addEventListener("click", function (e) {
  e.preventDefault();
  alert("Tính năng đang được phát triển!");
});

// Khởi tạo Google Sign-In khi trang load xong
window.onload = initializeGoogleSignIn;
