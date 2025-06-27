// frontend/pages/admin/dashboard.js
import { ProductList } from "./js/products/productList.js";
import { CategoryList } from "./js/categories/categoryList.js";
import { BlogList } from "./js/blogs/blogList.js";
import { UsersList } from "./js/users/usersList.js";

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

  if (!token || !user || user.role !== "admin") {
    window.location.href = "../login/login.html";
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
    window.location.href = "../login/login.html";
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
      breadcrumb.textContent = "Quản lý người dùng";
      break;

    case "products":
      contentDiv.innerHTML = `
                <div class="page-header">
                    <h3>Kiểm duyệt sản phẩm</h3>
                </div>
                <div id="productListContainer"></div>
            `;
      new ProductList("productListContainer");
      breadcrumb.textContent = "Quản lý Sản phẩm";
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
      breadcrumb.textContent = "Quản lý Danh mục";
      break;

    case "blog-posts":
      contentDiv.innerHTML = `
    <div class="page-header">
      <h3>Bài viết</h3>
      <button class="add-btn" id="addBlogBtn">
        <i class="fas fa-plus"></i> Thêm bài viết
      </button>
    </div>
    <div id="blogListContainer"></div>
  `;
      new BlogList("blogListContainer");
      breadcrumb.textContent = "Quản lý Blog";
      break;


    default:
      contentDiv.innerHTML = "<h2>Trang không tồn tại</h2>";
      breadcrumb.textContent = "404 Not Found";
  }
}
