import { UserAPI } from "../APIs/userAPI.js";
import { showNotification } from "../APIs/utils/notification.js";

document.addEventListener("DOMContentLoaded", () => {
  const sidebarLinks = document.querySelectorAll(".settings-sidebar a");
  const personalInfoSection = document.getElementById("personal-info-section");
  const changePasswordSection = document.getElementById("change-password-section");

  const personalInfoForm = document.getElementById("personalInfoForm");
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const genderSelect = document.getElementById("gender");
  const dobInput = document.getElementById("dob");
  const addressInput = document.getElementById("address");
  const avatarInput = document.getElementById("avatar");
  const avatarPreview = document.getElementById("avatarPreview");

  const changePasswordForm = document.getElementById("changePasswordForm");
  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword");

  const showSection = (sectionId) => {
    personalInfoSection.classList.add("hidden");
    changePasswordSection.classList.add("hidden");
    if (sectionId === "personal-info") {
      personalInfoSection.classList.remove("hidden");
      loadPersonalInfo();
    } else if (sectionId === "change-password") {
      changePasswordSection.classList.remove("hidden");
    }
  };

  const loadPersonalInfo = async () => {
    try {
      const response = await UserAPI.getCurrentUser();
      if (response.success) {
        const user = response.data;
        fullNameInput.value = user.fullName || "";
        emailInput.value = user.email || "";
        phoneInput.value = user.phone || "";
        genderSelect.value = user.gender || "";
        dobInput.value = user.dateofbirth ? new Date(user.dateofbirth).toISOString().split("T")[0] : "";
        addressInput.value = user.address || "";
        if (user.avatarUrl) {
          avatarPreview.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
          avatarPreview.innerHTML = `<div class="default-avatar">NA</div>`;
        }
      } else {
        showNotification(`Lỗi tải thông tin: ${response.error || "Không xác định"}`, "error");
      }
    } catch (error) {
      console.error("Lỗi tải thông tin người dùng:", error);
      showNotification("Không thể tải thông tin người dùng.", "error");
    }
  };

  const uploadToCloudinary = async (base64) => {
    const data = new FormData();
    data.append("file", base64);
    data.append("upload_preset", "t5market_avatar"); // 👉 thay bằng preset thực tế
    data.append("cloud_name", "dipcjvi8x"); // 👉 thay bằng cloud name thực tế

    const res = await fetch("https://api.cloudinary.com/v1_1/dipcjvi8x/image/upload", {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      throw new Error("Upload ảnh thất bại.");
    }

    const result = await res.json();
    return result.secure_url;
  };

  personalInfoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedData = {
      fullName: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      gender: genderSelect.value,
      dateofbirth: dobInput.value,
      address: addressInput.value.trim(),
    };

    if (avatarInput.files.length > 0) {
      const file = avatarInput.files[0];

      new Compressor(file, {
        quality: 0.6,
        maxWidth: 600,
        success: async (compressedFile) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const imageUrl = await uploadToCloudinary(reader.result);
              updatedData.avatarUrl = imageUrl;

              const response = await UserAPI.updateProfile(updatedData);
              if (response.success) {
                showNotification("Cập nhật thông tin thành công!", "success");
                const user = JSON.parse(localStorage.getItem("user"));
                if (user) {
                  localStorage.setItem("user", JSON.stringify({ ...user, ...response.data }));
                }
              } else {
                showNotification(`Cập nhật thất bại: ${response.error || "Không xác định"}`, "error");
              }
            } catch (err) {
              console.error("❌ Lỗi upload avatar:", err);
              showNotification("Không thể upload ảnh đại diện.", "error");
            }
          };
          reader.readAsDataURL(compressedFile);
        },
        error(err) {
          console.error("❌ Nén ảnh lỗi:", err);
          showNotification("Không thể nén ảnh đại diện.", "error");
        },
      });
    } else {
      updatedData.avatarUrl = avatarPreview.querySelector("img")?.src || "";
      try {
        const response = await UserAPI.updateProfile(updatedData);
        if (response.success) {
          showNotification("Cập nhật thông tin thành công!", "success");
          const user = JSON.parse(localStorage.getItem("user"));
          if (user) {
            localStorage.setItem("user", JSON.stringify({ ...user, ...response.data }));
          }
        } else {
          showNotification(`Cập nhật thất bại: ${response.error || "Không xác định"}`, "error");
        }
      } catch (error) {
        console.error("Lỗi cập nhật thông tin:", error);
        showNotification("Không thể cập nhật thông tin.", "error");
      }
    }
  });

  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    if (newPassword !== confirmNewPassword) {
      showNotification("Mật khẩu mới và xác nhận không khớp.", "error");
      return;
    }

    try {
      const response = await UserAPI.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      if (response.success) {
        showNotification("Đổi mật khẩu thành công!", "success");
        changePasswordForm.reset();
      } else {
        showNotification(`Đổi mật khẩu thất bại: ${response.error || "Không xác định"}`, "error");
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      showNotification("Không thể đổi mật khẩu.", "error");
    }
  });

  // Avatar preview
  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      };
      reader.readAsDataURL(file);
    } else {
      avatarPreview.innerHTML = `<div class="default-avatar">NA</div>`;
    }
  });

  // Navigation
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      sidebarLinks.forEach((item) => item.classList.remove("active"));
      e.target.classList.add("active");
      const section = e.target.dataset.section;
      showSection(section);
    });
  });

  // Load mặc định
  showSection("personal-info");
});
