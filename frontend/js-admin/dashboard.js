// frontend/pages/admin/dashboard.js
import { ProductList } from "./products/productList.js";
import { CategoryList } from "./categories/categoryList.js";
import { UsersList } from "./users/usersList.js";
import { ApproveUserList } from "./users/approveUser.js";
import { ApproveShopList } from "./shops/upgradeShop.js"
import { Role } from "../APIs/utils/roleEnum.js";


document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra đăng nhập
  checkAdminAuth();

  // Khởi tạo sự kiện cho menu
  initializeMenu();

  // Load trang mặc định
  loadPage("users");
});

function checkAdminAuth() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("ROLE CHECK:", user.role, Role.ADMIN);
  if (!token || !user || Number(user.role) !== Role.ADMIN) {
    window.location.href = "./login.html";
  }
}

function initializeMenu() {
  document.querySelectorAll(".menu-section a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = e.target.closest("a").dataset.page;
      loadPage(page);

      // Cập nhật active state
      document
        .querySelectorAll(".menu-section a")
        .forEach((a) => a.classList.remove("active"));
      e.target.closest("a").classList.add("active");
    });
  });

  // Xử lý đăng xuất
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "./login.html";
  });
}

function loadPage(page) {
  const contentDiv = document.getElementById("pageContent");
  const breadcrumb = document.getElementById("breadcrumb");

  switch (page) {
    case "users":
      contentDiv.innerHTML =`
          <div class="page-header">
            <h3>Người dùng</h3>
            <button class="add-btn" id="addUserBtn">
              <i class="fas fa-plus"></i> Thêm người dùng
            </button>
          </div>
          <div id="userListContainer"></div>
      `;
      new UsersList("userListContainer");
      breadcrumb.textContent = "Quản Lý Người Dùng";
      break;

    case "upgrade-sellers":
      contentDiv.innerHTML =`
          <div class="page-header">
            <h3>Nâng Cấp Cửa Hàng</h3>
          </div>
          <div id="upgradeSellersContainer"></div>
      `;
      new ApproveShopList("upgradeSellersContainer");
      breadcrumb.textContent = "Quản Lý Người Dùng";
      break;

    case "all-products":
      contentDiv.innerHTML = `
                <div class="page-header">
                    <h3>Tất cả bài đăng</h3>
                </div>
                <div id="productListContainer"></div>
            `;
      new ProductList("productListContainer");
      breadcrumb.textContent = "Quản Lý Bài Đăng";
      break;

    case "categories":
      contentDiv.innerHTML = `
                <div class="page-header">
                    <h3>Quản lý danh mục</h3>
                    <button class="add-btn" id="addCategoryBtn">
                        <i class="fas fa-plus"></i> Tạo danh mục mới
                    </button>
                </div>
                <div id="categoriesListContainer"></div>
            `;
      new CategoryList("categoriesListContainer");
      breadcrumb.textContent = "Quản Lý Bài Đăng";
      break;

    case "approve-user":
      contentDiv.innerHTML = `
                <div class="page-header">
                    <h3>Kiểm duyệt tài khoản</h3>
                </div>
                <div id="approveUserListContainer"></div>
            `;
      new ApproveUserList("approveUserListContainer");
      breadcrumb.textContent = "Quản lý kiểm duyệt";
      break;


    default:
      contentDiv.innerHTML = "<h2>Trang không tồn tại</h2>";
      breadcrumb.textContent = "404 Not Found";
  }
}
