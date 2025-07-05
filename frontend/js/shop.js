// frontend/pages/shop/shop.js
document.addEventListener("DOMContentLoaded", () => {
  const noShopSection = document.getElementById("noShopSection");
  const hasShopSection = document.getElementById("hasShopSection");

  // New elements for hasShopSection
  const shopNameElement = document.querySelector(".shop-name");
  const shopStatusElement = document.querySelector(".shop-status");
  const shopProductsCount = document.getElementById("shopProductsCount");
  const shopSoldCount = document.getElementById("shopSoldCount");
  const shopChatFeedback = document.getElementById("shopChatFeedback");
  const shopJoinedDate = document.getElementById("shopJoinedDate");
  const shopFollowersCount = document.getElementById("shopFollowersCount");
  const shopIntroDescription = document.getElementById("shopIntroDescription");
  const shopIntroAddress = document.getElementById("shopIntroAddress");
  const shopIntroPhoneMasked = document.getElementById("shopIntroPhoneMasked");
  const shopPoliciesList = document.getElementById("shopPoliciesList");
  const noShopPolicyMessage = document.getElementById("noShopPolicyMessage");
  const showPhoneNumberLink = document.querySelector("#hasShopSection .show-phone-number-link");

  // Function to update UI based on user's shop status
  const updateShopStatusUI = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && (user.role === "seller" || user.role === "admin" || user.role === "manager" || user.role === "mod" || user.role === "staff")) {
      noShopSection.classList.add("hidden");
      hasShopSection.classList.remove("hidden");

      // Populate shop profile details (placeholders for now)
      if (shopNameElement) shopNameElement.textContent = user.fullName ? user.fullName + "'s Shop" : "Tên Cửa hàng của Bạn"; // Example shop name
      if (shopStatusElement) shopStatusElement.textContent = "Đang hoạt động"; // Example status
      if (shopProductsCount) shopProductsCount.textContent = "15"; // Placeholder
      if (shopSoldCount) shopSoldCount.textContent = "120"; // Placeholder
      if (shopChatFeedback) shopChatFeedback.textContent = "Rất tốt"; // Placeholder
      if (shopJoinedDate) shopJoinedDate.textContent = "20/05/2023"; // Placeholder
      if (shopFollowersCount) shopFollowersCount.textContent = "500"; // Placeholder
      if (shopIntroDescription) shopIntroDescription.textContent = "Chào mừng đến với cửa hàng của tôi, nơi bạn tìm thấy những sản phẩm công nghệ chất lượng cao!";
      if (shopIntroAddress) shopIntroAddress.textContent = "123 Đường Công Nghệ, Quận 1, TP.HCM";

      // Handle phone number display and 'Hiện số' link
      const fullPhoneNumber = "0962568279"; // This should come from user data
      if (shopIntroPhoneMasked) shopIntroPhoneMasked.textContent = fullPhoneNumber.substring(0, fullPhoneNumber.length - 4) + '****';
      if (showPhoneNumberLink) {
          showPhoneNumberLink.dataset.fullPhone = fullPhoneNumber;
          showPhoneNumberLink.addEventListener('click', (e) => {
              e.preventDefault();
              if (shopIntroPhoneMasked.textContent.includes('****')) {
                  shopIntroPhoneMasked.textContent = showPhoneNumberLink.dataset.fullPhone;
                  showPhoneNumberLink.textContent = 'Ẩn số';
              } else {
                  shopIntroPhoneMasked.textContent = fullPhoneNumber.substring(0, fullPhoneNumber.length - 4) + '****';
                  showPhoneNumberLink.textContent = 'Hiện số';
              }
          });
      }

      // Populate policies (example static policies for now)
      const policies = [
          { icon: 'fas fa-truck', text: 'Miễn phí vận chuyển nội thành' },
          { icon: 'fas fa-shield-alt', text: 'Bảo hành 12 tháng' },
          { icon: 'fas fa-exchange-alt', text: 'Đổi trả trong 7 ngày' }
      ];

      if (shopPoliciesList) {
          shopPoliciesList.innerHTML = '';
          if (policies.length > 0) {
              policies.forEach(policy => {
                  const li = document.createElement("li");
                  li.innerHTML = `<i class="${policy.icon} policy-icon"></i>${policy.text}`;
                  shopPoliciesList.appendChild(li);
              });
              noShopPolicyMessage.classList.add('hidden');
          } else {
              noShopPolicyMessage.classList.remove('hidden');
          }
      }

    } else {
      noShopSection.classList.remove("hidden");
      hasShopSection.classList.add("hidden");

      // Update user info in dashboard if not a seller/admin (for noShopSection)
      const userNameElement = document.querySelector(".user-profile-summary .user-name");
      const avatarElement = document.querySelector(".user-profile-summary .avatar");
      if (user) {
        if (userNameElement) userNameElement.textContent = user.fullName || "Người dùng";
        if (avatarElement) avatarElement.textContent = (user.fullName ? user.fullName.charAt(0) : "H").toUpperCase();
      }
    }
  };

  // Initial UI setup
  updateShopStatusUI();

  // Tab switching functionality for new shop-nav-tabs
  const shopNavTabs = document.querySelectorAll(".shop-nav-tab");
  const shopContentArea = document.querySelector(".shop-content-area"); // This might be used to switch content later

  shopNavTabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
    e.preventDefault();

      // Remove active class from all tabs
      shopNavTabs.forEach(t => t.classList.remove("active"));

      // Add active class to the clicked tab
      e.target.classList.add("active");

      // TODO: Implement logic to load content based on data-tab attribute for hasShopSection
      console.log("Shop Tab clicked:", e.target.dataset.tab);
    });
  });

  // Tab switching functionality for old dashboard-nav-tabs (still in noShopSection)
  const dashboardNavTabs = document.querySelectorAll(".dashboard-nav-tabs .nav-tab");
  const dashboardContent = document.querySelector(".dashboard-content");

  dashboardNavTabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
    e.preventDefault();

      // Remove active class from all tabs
      dashboardNavTabs.forEach(t => t.classList.remove("active"));

      // Add active class to the clicked tab
      e.target.classList.add("active");

      // Update content based on the clicked tab
      const selectedTab = e.target.dataset.tab;
      console.log("Dashboard Tab clicked:", selectedTab);

      // Here you would add logic to dynamically load content for each tab
      // For example:
      // if (selectedTab === "all") { /* load all listings */ }
      // else if (selectedTab === "dangHienThi") { /* load active listings */ }
      // else if (selectedTab === "choDuyet") { /* load pending listings */ }
      // else if (selectedTab === "biTuChoi") { /* load rejected listings */ }
      // else if (selectedTab === "lichSuDangTin") { /* load listing history */ }

      // For now, keep the empty-listings content as a placeholder
    });
  });

}); 