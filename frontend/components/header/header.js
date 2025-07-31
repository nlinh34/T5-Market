import { Role } from "../../APIs/utils/roleEnum.js";
import { ProductAPI } from "../../APIs/productAPI.js";

class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <header>
        <div class="logo">
          <img class="logo-img" src="./assests/images/logo.png" alt="">
          <div class="logo-content">T5MARKET</div>
        </div>
        <div class="category">
          <i class="fa fa-bars"></i>
          <p>Danh mục</p>
        </div>

        <form class="search" id="searchForm">
          <input type="text" id="searchInput" placeholder="Tìm kiếm sản phẩm...">
          <button type="submit">Tìm</button>
        </form>

        <div class="menu">
          <a href="./index.html">Trang Chủ</a>
          <a href="./menu.html">Sản Phẩm</a>
          <a href="./contact.html">Liên Hệ</a>
        </div>

        <a href="./cart.html" class="cart">
          <div class="cart-icon">
            <i class="fa fa-shopping-cart"></i>
            <span class="cart-count">0</span>
          </div>
        </a>

        <!-- Account Dropdown -->
        <div class="account-dropdown">
          <button class="account-toggle">
            <i class="fas fa-user"></i> Tài khoản <span class="arrow">▼</span>
          </button>
          <div class="account-menu hidden" id="accountMenu"></div>
        </div>

        <!-- Search Popup -->
        <div class="search-popup hidden" id="searchPopup">
          <div class="popup-content">
            <div class="popup-header">
              <h3>Kết quả tìm kiếm</h3>
              <button class="close-popup" id="closePopup">&times;</button>
            </div>
            <div class="popup-body" id="searchResults"></div>
          </div>
        </div>
      </header>
    `;

    this.updateUserInterface();
    this.initializeCartCount();
    this.setupDropdownToggle();
    this.setupSearch();
  }

  initializeCartCount() {
    const updateCartCountUI = () => {
      const countElement = this.querySelector(".cart-count");
      const user = JSON.parse(localStorage.getItem("user"));
      if (countElement) {
        countElement.textContent = user ? user.cartCount || 0 : 0;
      }
    };
    window.addEventListener("cartCountUpdated", updateCartCountUI);
    updateCartCountUI();
  }

  updateUserInterface() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const menu = this.querySelector("#accountMenu");

    if (token && user) {
      let html = `
        <a href="./favorites.html"><i class="fa fa-heart"></i>Mục yêu thích</a>
        <a href="./post-products.html"><i class="fa fa-pencil"></i>Đăng sản phẩm</a>
        <a href="./product-manager.html"><i class="fa fa-tasks"></i>Quản lý bài đăng</a>
        <a href="./seller-orders.html"><i class="fa fa-history"></i>Quản Lý Đơn hàng</a>
        <a href="./order-detail.html"><i class="fa fa-tasks"></i>Lịch Sử Mua Hàng</a>
        <a href="./account-settings.html"><i class="fa fa-cog"></i>Cài đặt tài khoản</a>
        <a href="./shop-register.html"><i class="fas fa-plus"></i> Tạo cửa hàng</a>
        <a href="./shop.html"><i class="fa fa-tasks"></i>Quản lý đăng tin</a>
        <a href="./shop-manager.html"><i class="fa fa-store"></i>Cửa hàng </a>
        <a href="#" id="logoutBtn"><i class="fa fa-sign-out"></i>Đăng xuất</a>
      `;

      if ([Role.ADMIN, Role.MANAGER, Role.MOD].includes(user.role)) {
        html += `<a href="./dashboard.html" target="_blank" class="dashboard-btn"><i class="fa fa-tachometer"></i>Trang quản trị</a>`;
      }

      if ([Role.SELLER, Role.STAFF].includes(user.role)) {
        html += `
        <a href="./post-products.html"><i class="fa fa-pencil"></i>Đăng sản phẩm</a>
        <a href="./product-manager.html"><i class="fa fa-tasks"></i>Quản lý bài đăng</a>
        <a href="./seller-orders.html"><i class="fa fa-history"></i>Quản Lý Đơn hàng</a>
        `;
      }

      menu.innerHTML = html;

      const logoutBtn = this.querySelector("#logoutBtn");
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      });
    } else {
      menu.innerHTML = `
        <a href="./login.html">Đăng nhập</a>
        <a href="./register.html">Đăng ký</a>
      `;
    }
  }

  setupDropdownToggle() {
    const toggleBtn = this.querySelector(".account-toggle");
    const menu = this.querySelector(".account-menu");

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
    });

    window.addEventListener("click", () => {
      menu.classList.add("hidden");
    });
  }

  setupSearch() {
    const searchForm = this.querySelector("#searchForm");
    const searchInput = this.querySelector("#searchInput");
    const searchPopup = this.querySelector("#searchPopup");
    const searchResults = this.querySelector("#searchResults");
    const closePopup = this.querySelector("#closePopup");
    const fallbackImg = "https://t4.ftcdn.net/jpg/05/82/98/21/360_F_582982149_kN0XAeccaysWXvcHr4s3bhitFSVU8rlP.jpg";

    function formatPriceVND(price) {
      return price.toLocaleString("vi-VN") + " VND";
    }

    function validateImageUrl(url, fallbackUrl) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(fallbackUrl);
        img.src = url;
      });
    }

    async function handleSearch(e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (!query) return;

      searchResults.innerHTML = "<p>Đang tìm kiếm...</p>";
      searchPopup.classList.remove("hidden");

      try {
        const result = await ProductAPI.searchProductsByName(query);
        const products = result.data;

        if (!products || products.length === 0) {
          searchResults.innerHTML = "<p>Không tìm thấy sản phẩm nào.</p>";
          return;
        }

        searchResults.innerHTML = "";
        products.forEach(async (product) => {
          const imgCandidate = product.images && product.images.length > 0 ? product.images[0] : fallbackImg;
          const validImg = await validateImageUrl(imgCandidate, fallbackImg);

          const productHTML = `
            <div class="search-result-item">
              <img src="${validImg}" alt="${product.name}" />
              <div class="search-result-content">
                <h4>${product.name}</h4>
                <p class="price">${formatPriceVND(product.price)}</p>
                <a href="./product.html?id=${product._id}" class="view-details">Xem chi tiết</a>
              </div>
            </div>
          `;
          searchResults.insertAdjacentHTML("beforeend", productHTML);
        });
      } catch (err) {
        searchResults.innerHTML = "<p>Lỗi khi tìm kiếm sản phẩm.</p>";
        console.error("Lỗi tìm kiếm:", err);
      }
    }

    searchForm.addEventListener("submit", handleSearch);
    closePopup.addEventListener("click", () => {
      searchPopup.classList.add("hidden");
    });

    // Đóng popup khi click bên ngoài
    window.addEventListener("click", (e) => {
      if (!searchPopup.contains(e.target) && !searchForm.contains(e.target)) {
        searchPopup.classList.add("hidden");
      }
    });
  }
}

customElements.define("header-component", Header);