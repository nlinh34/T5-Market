import { ShopAPI } from '../../APIs/shopAPI.js';
import { Role } from '../../APIs/utils/roleEnum.js';
import { UserAPI } from '../../APIs/userAPI.js';
import { CategoryAPI } from '../../APIs/categoryAPI.js';
import CartAPI from '../../APIs/cartAPI.js';

class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
      <header>
        <a href="./index.html" class="logo">
          <img  loading="lazy" class="logo-img" src="./assests/images/logo.png" alt="T5Market Logo">
          <div class="logo-content">T5MARKET</div>
        </a>

        <form class="search">
          <input type="text" placeholder="Tìm kiếm sản phẩm...">
          <button type="submit" aria-label="Tìm kiếm"><i class="fas fa-search"></i></button>
        </form>

        <div class="menu">
          <a href="./index.html">Trang Chủ</a>
          <a href="./menu.html">Sản Phẩm</a>
          <a href="./contact.html">Liên Hệ</a>
        </div>

        <div class="header-right">
          <a href="./cart.html" class="cart">
            <div class="cart-icon">
              <i class="fa fa-shopping-cart"></i>
              <span class="cart-count">0</span>
            </div>
          </a>
  
          <!-- Account Dropdown -->
          <div class="account-dropdown">
            <button class="account-toggle">
              <div class="user-info" id="loggedInUserDisplay" style="display: none;">
                <img loading="lazy" src="" alt="Avatar" class="user-avatar" id="userAvatar">
                <span class="username" id="usernameDisplay"></span>
              </div>
              <div class="logged-out-info" id="loggedOutUserDisplay">
                <i class="fas fa-user"></i> <span class="account-text">Tài khoản</span>
              </div>
              <span class="arrow">▼</span>
            </button>
            <div class="account-menu hidden" id="accountMenu"></div>
          </div>

          <button class="hamburger" aria-label="Toggle menu"><i class="fas fa-bars"></i></button>
        </div>
      </header>
      <div class="mobile-menu">
        <button class="close-btn">&times;</button>
        <a href="./index.html">Trang Chủ</a>
        <a href="./menu.html">Sản Phẩm</a>
        <a href="./contact.html">Liên Hệ</a>
      </div>
      <div class="mobile-menu-overlay"></div>
    `;

        this.updateUserInterface();
        this.initializeCartCount();
        this.setupDropdownToggle();
        this.setupHamburgerMenu();
        this.setupSearch();
        this.setupScrollListener();
    }

    initializeCartCount() {
        const updateCartCountUI = async() => {
            try {
                const res = await CartAPI.getCart();
                const items = (res.cart && res.cart.items) || [];

                // Tính tổng số lượng sản phẩm
                const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

                this.querySelector(".cart-count").textContent = totalCount;
            } catch (err) {
                console.error("❌ Lỗi khi lấy số lượng giỏ hàng:", err);
                this.querySelector(".cart-count").textContent = "0";
            }
        };

        updateCartCountUI(); // Lần đầu khi load

        // Cập nhật lại khi có sự kiện cartUpdated
        window.addEventListener("cartUpdated", updateCartCountUI);
    }

    async updateUserInterface() {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const menu = this.querySelector("#accountMenu");
        const userAvatar = this.querySelector("#userAvatar");
        const usernameDisplay = this.querySelector("#usernameDisplay");
        const loggedInUserDisplay = this.querySelector("#loggedInUserDisplay");
        const loggedOutUserDisplay = this.querySelector("#loggedOutUserDisplay");

        if (token && user) {
            if (!user.avatarUrl || !user.fullName) {
                try {
                    const response = await UserAPI.getCurrentUser();
                    if (response.success && response.data) {
                        localStorage.setItem("user", JSON.stringify(response.data));
                        user.avatarUrl = response.data.avatarUrl;
                        user.fullName = response.data.fullName;
                    }
                } catch (error) {
                    console.error("Error fetching current user data:", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "./login.html";
                    return; 
                }
            }

            if (userAvatar && usernameDisplay) {
                userAvatar.src = user.avatarUrl || "./assests/images/default-product.png"; 
                usernameDisplay.textContent = user.fullName || "Tài khoản"; 
            }
            if (loggedInUserDisplay && loggedOutUserDisplay) {
                loggedInUserDisplay.style.display = 'flex';
                loggedOutUserDisplay.style.display = 'none';
            }

            let shopLinkHtml = '';
            let hasApprovedShop = false;
            try {
                const shopResponse = await ShopAPI.getMyShop();
                if (shopResponse.success && shopResponse.data) {
                    const shop = shopResponse.data;
                    if (shop.status === 'approved') {
                        shopLinkHtml = `<a href="./shop-manager.html"><i class="fa fa-store"></i>Cửa hàng của bạn</a>`;
                        hasApprovedShop = true;
                    } else {
                        shopLinkHtml = `<a href="./shop-register.html"><i class="fa fa-hourglass-half"></i>Trạng thái cửa hàng</a>`;
                    }
                } else {
                    shopLinkHtml = `<a href="./shop-register.html"><i class="fas fa-plus"></i> Tạo cửa hàng</a>`;
                }
            } catch (error) {
                shopLinkHtml = `<a href="./shop-register.html"><i class="fas fa-plus"></i> Tạo cửa hàng</a>`;
            }

            let html = `
        <div class="account-menu-header">
          <div class="account-menu-avatar">
            <img loading="lazy" src="${user.avatarUrl || './assests/images/default-product.png'}" alt="User Avatar">
          </div>
          <div class="account-menu-username">${user.fullName || 'Tài khoản của bạn'}</div>
        </div>
        <a href="./favorites.html"><i class="fa fa-heart"></i>Mục yêu thích</a>
        <a href="./order-detail.html"><i class="fa fa-tasks"></i>Lịch Sử Mua Hàng</a>
        ${shopLinkHtml}
      `;

            if ([Role.ADMIN, Role.MANAGER, Role.MOD].includes(user.role)) {
                html += `<a href="./dashboard.html" target="_blank" class="dashboard-btn"><i class="fa fa-tachometer"></i>Trang quản trị</a>`;
            }

            if ([Role.SELLER, Role.STAFF].includes(user.role)) {
                html += `
                ${hasApprovedShop ? '<a href="./shop-analytics.html"><i class="fas fa-chart-line"></i>Báo cáo thống kê</a>' : ''}
        <a href="./post-products.html"><i class="fa fa-pencil"></i>Đăng sản phẩm</a>
        <a href="./seller-orders.html"><i class="fa fa-history"></i>Quản Lý Đơn hàng</a>
        `
            }

            html += `
        <a href="./account-settings.html"><i class="fa fa-cog"></i>Cài đặt tài khoản</a>
        <a href="#" id="logoutBtn"><i class="fa fa-sign-out"></i>Đăng xuất</a>
      `;

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
            if (loggedInUserDisplay && loggedOutUserDisplay) {
                loggedInUserDisplay.style.display = 'none';
                loggedOutUserDisplay.style.display = 'flex';
            }
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

    setupHamburgerMenu() {
        const hamburger = this.querySelector(".hamburger");
        const mobileMenu = this.querySelector(".mobile-menu");
        const closeBtn = this.querySelector(".close-btn");
        const overlay = this.querySelector(".mobile-menu-overlay");

        if (hamburger && mobileMenu && closeBtn && overlay) {
            const openMenu = () => {
                mobileMenu.classList.add("active");
                overlay.classList.add("active");
                document.body.style.overflow = 'hidden';
            };

            const closeMenu = () => {
                mobileMenu.classList.remove("active");
                overlay.classList.remove("active");
                document.body.style.overflow = ''; 
            };

            hamburger.addEventListener("click", openMenu);
            closeBtn.addEventListener("click", closeMenu);
            overlay.addEventListener("click", closeMenu);

            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    closeMenu();
                }
            });

            window.addEventListener('popstate', closeMenu);
        }
    }

    setupSearch() {
        const searchForm = this.querySelector(".search");
        if (searchForm) {
            searchForm.addEventListener("submit", async(event) => {
                event.preventDefault();
                const searchInput = this.querySelector('.search input[type="text"]');
                const query = (searchInput.value || "").trim();

                window.location.href = `./menu.html?search=${encodeURIComponent(query)}`;
            });
        }
    }

    setupScrollListener() {
        const header = this.querySelector('header');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
    }
}

customElements.define("header-component", Header);