import { ShopAPI } from '../../APIs/shopAPI.js';
import { Role } from '../../APIs/utils/roleEnum.js';

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
      const cartCount = localStorage.getItem("cartCount") || 0;
      this.querySelector(".cart-count").textContent = cartCount;
    };
    updateCartCountUI(); // Initial call
    window.addEventListener("cartUpdated", updateCartCountUI);
  }

  async updateUserInterface() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const menu = this.querySelector("#accountMenu");

    if (token && user) {

      let shopLinkHtml = '';
      try {
        const shopResponse = await ShopAPI.getMyShop();
        if (shopResponse.success && shopResponse.data) {
            const shop = shopResponse.data;
            if (shop.status === 'approved') {
                shopLinkHtml = `<a href="./shop-manager.html"><i class="fa fa-store"></i>Cửa hàng của bạn</a>`;
            } else {
                shopLinkHtml = `<a href="./shop-register.html"><i class="fa fa-hourglass-half"></i>Trạng thái cửa hàng</a>`;
            }
        }
      } catch (error) {
          // No shop exists, show create link
          shopLinkHtml = `<a href="./shop-register.html"><i class="fas fa-plus"></i> Tạo cửa hàng</a>`;
      }


      let html = `
        <a href="./favorites.html"><i class="fa fa-heart"></i>Mục yêu thích</a>
        <a href="./order-detail.html"><i class="fa fa-tasks"></i>Lịch Sử Mua Hàng</a>
        <a href="./account-settings.html"><i class="fa fa-cog"></i>Cài đặt tài khoản</a>
        ${shopLinkHtml}
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
        window.location.href = "./index.html";
      });
    } else {
      menu.innerHTML = `
        <a href="./login.html">Đăng nhập</a>
        <a href="./register.html">Đăng ký</a>
      `;
    }
  }

  setupDropdownToggle() {
    const accountToggle = this.querySelector(".account-toggle");
    const accountMenu = this.querySelector("#accountMenu");

    accountToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      accountMenu.classList.toggle("hidden");
    });

    // Ẩn dropdown khi click bên ngoài
    document.addEventListener("click", (event) => {
      if (!accountToggle.contains(event.target)) {
        accountMenu.classList.add("hidden");
      }
    });
  }
}

customElements.define("header-component", Header);
