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
          <button class="account-toggle" id="accountToggleBtn">
            <!-- Content will be set by JavaScript -->
          </button>
          <div class="account-menu hidden" id="accountMenu"></div>
        </div>
      </header>
    `;

        this.updateUserInterface(); // This will set the correct initial state
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
        const accountToggleBtn = this.querySelector("#accountToggleBtn");

        // Update the account toggle button content
        if (accountToggleBtn) {
            if (token && user && user.fullName) {
                // Display avatar and name if logged in
                const avatar = user.avatarUrl ? `<img src="${user.avatarUrl}" alt="Avatar" class="account-avatar" />` : `<i class="fas fa-user-circle"></i>`;
                accountToggleBtn.innerHTML = `${avatar} ${user.fullName} <i class="fa-solid fa-chevron-up fa-rotate-180" style="color: #f5f5f5;"></i>`;
            } else {
                // Display default "Tài khoản" if not logged in or no full name
                accountToggleBtn.innerHTML = `<i class="fas fa-user"></i> Tài khoản <i class="fa-solid fa-chevron-up fa-rotate-180" style="color: #f5f5f5;"></i>`;
            }
        }

        if (token && user) {
            let html = `
        <a href="./favorites.html"><i class="fa fa-heart"></i>Mục yêu thích</a>
        <a href="./post-products.html"><i class="fa fa-pencil"></i>Đăng sản phẩm</a>
        
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
            if (!menu.classList.contains("hidden")) {
                toggleBtn.classList.add("dropdown-open");
            } else {
                toggleBtn.classList.remove("dropdown-open");
            }
        });

        // Ẩn dropdown khi click bên ngoài
        window.addEventListener("click", () => {
            menu.classList.add("hidden");
            toggleBtn.classList.remove("dropdown-open"); // Ensure icon resets when clicking outside
        });
    }
}

customElements.define("header-component", Header);