import { ProductAPI } from "../../APIs/productAPI.js";
import { CategoryAPI } from "../../APIs/categoryAPI.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".product-grid");

  // ==== Mobile menu toggle ====
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("active");
    });
  });

  // ==== Render sản phẩm ====
  function renderProducts(products) {
    if (!products || products.length === 0) {
      container.innerHTML = "<p>Không có sản phẩm nào.</p>";
      return;
    }

    const html = products.map(product => `
      <div class="product-card">
        <img src="${product.image_url}" alt="${product.name}" />
        <div class="product-info">
          <button class="like-btn" data-id="${product._id}" title="Thêm yêu thích">
            <i class="fa-solid fa-heart"></i>
          </button>
          <h3>${product.name}</h3>
          <div class="price">${product.price.toLocaleString()}đ</div>
          <div class="rating">
            ${"★".repeat(product.rating || 4)}${"☆".repeat(5 - (product.rating || 4))}
          </div>
          <div class="button-group">
            <button class="btn">
              <a href="../detail-product/product.html?id=${product._id}" style="color:white;">Mua ngay</a>
            </button>
            <button class="buton">
              <a href="../cart/cart.html?id=${product._id}" style="color:white;">
                Giỏ hàng <i class="fa-solid fa-cart-shopping"></i>
              </a>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    container.innerHTML = html;

    // ✅ GẮN SỰ KIỆN TRÁI TIM SAU KHI RENDER
    document.querySelectorAll(".like-btn").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");

        let liked = JSON.parse(localStorage.getItem("favorites")) || [];
        if (!liked.includes(id)) {
          liked.push(id);
          localStorage.setItem("favorites", JSON.stringify(liked));
          alert("Đã thêm vào mục yêu thích!");
        } else {
          alert("Sản phẩm đã có trong mục yêu thích.");
        }
      });
    });
  }

  // ==== Lọc theo danh mục ====
  async function handleFilter() {
    const checked = document.querySelectorAll(".category-filter:checked");
    const selectedIds = [...checked].map(cb => cb.value);

    container.innerHTML = "Đang lọc sản phẩm...";

    try {
      let url = "http://localhost:5000/products/approved";
      if (selectedIds.length > 0) {
        url += `?category=${selectedIds.join(",")}`;
      }

      const res = await fetch(url);
      const result = await res.json();
      const products = result.data;

      renderProducts(products);
    } catch (err) {
      container.innerHTML = "<p>Lỗi khi tải sản phẩm.</p>";
      console.error("Lỗi lọc sản phẩm:", err);
    }
  }

  // ==== Tải danh mục ====
  async function loadCategorySidebar() {
    try {
      const result = await CategoryAPI.getAllCategories();
      const categories = result.data;

      const categoryList = document.querySelector(".sidebar ul");
      if (!categoryList || !categories) return;

      const html = categories.map(c => `
        <li>
          <label>
            <input type="checkbox" class="category-filter" value="${c._id}" />
            ${c.name}
          </label>
        </li>
      `).join("");

      categoryList.innerHTML = html;

      // Gắn sự kiện lọc sau khi render
      document.querySelectorAll(".category-filter").forEach(cb => {
        cb.addEventListener("change", handleFilter);
      });
    } catch (err) {
      console.error("Lỗi khi tải danh mục sidebar:", err);
    }
  }

  // ==== Tải toàn bộ sản phẩm lúc đầu ====
  function loadAllProducts() {
    container.innerHTML = "Đang tải sản phẩm...";
    ProductAPI.getAllProducts().then(res => {
      const products = res.data;
      renderProducts(products);
    }).catch(err => {
      container.innerHTML = "<p>Lỗi khi tải sản phẩm.</p>";
      console.error("Lỗi lấy sản phẩm:", err);
    });
  }

  // ==== Bắt đầu ====
  loadCategorySidebar();
  loadAllProducts();
});
