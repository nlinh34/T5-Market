import { Role } from "../../APIs/utils/roleEnum.js";

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

        <form class="search">
          <input type="text" placeholder="Tìm kiếm sản phẩm...">
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
      </header>
    `;

    this.updateUserInterface();
    this.initializeCartCount();
    this.setupDropdownToggle();
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
        `
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

    // Ẩn dropdown khi click bên ngoài
    window.addEventListener("click", () => {
      menu.classList.add("hidden");
    });
  }
}

customElements.define("header-component", Header);
