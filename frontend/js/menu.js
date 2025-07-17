import { ProductAPI } from "../APIs/productAPI.js";
import { CategoryAPI } from "../APIs/categoryAPI.js";
import CartAPI from "../APIs/cartAPI.js";


document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".product-grid");

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const slider = document.querySelector('.ad-slider');
  const slides = document.querySelectorAll('.ad-slide');
  let currentIndex = 0;

  function nextSlide() {
    currentIndex++;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;

    if (currentIndex === slides.length) {
      setTimeout(() => {
        slider.style.transition = 'none';
        slider.style.transform = 'translateX(0%)';
        currentIndex = 0;
        setTimeout(() => {
          slider.style.transition = 'transform 0.5s ease-in-out';
        }, 50);
      }, 500);
    }
  }

  setInterval(nextSlide, 5000);

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
  function validateImageUrl(url, fallbackUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(fallbackUrl);
      img.src = url;
    });
  }


  const fallbackImg = "https://t4.ftcdn.net/jpg/05/82/98/21/360_F_582982149_kN0XAeccaysWXvcHr4s3bhitFSVU8rlP.jpg";


  async function addToCart(productId) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    try {
      const result = await CartAPI.addProduct(productId, 1);
      if (result.success) {
        alert("✅ Đã thêm sản phẩm vào giỏ hàng!");
      } else {
        alert("❌ Thêm thất bại: " + (result.error || "Lỗi không xác định"));
      }
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
      alert("❌ Có lỗi xảy ra khi thêm vào giỏ hàng.");
    }
  }

  function attachAddToCartEvents() {
  const buttons = document.querySelectorAll(".add-to-cart-btn");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id");
      if (!productId) return;
      addToCart(productId);
    });
  });
}



  function renderProducts(products) {
    const container = document.querySelector('.product-grid');
    container.innerHTML = "";

    if (!products || products.length === 0) {
      container.innerHTML = "<p>Không có sản phẩm nào.</p>";
      return;
    }

    products.forEach(product => {
      const imgElId = `product-img-${product._id}`;
      const productCardHTML = generateProductCard(product, fallbackImg, imgElId);
      container.insertAdjacentHTML("beforeend", productCardHTML);

      const imgCandidate = product.images && product.images.length > 0 ? product.images[0] : null;

      if (imgCandidate) {
        validateImageUrl(imgCandidate, fallbackImg).then(validUrl => {
          const imgEl = document.getElementById(imgElId);
          if (imgEl) imgEl.src = validUrl;
        });
      }
    });
  }

  function generateProductCard(product, imgSrc, imgElId) {
    return `
    <div class="new-product-card">
      <div class="card-top">
        <img id="${imgElId}" src="${imgSrc}" alt="${product.name}" />
        <button class="like-btn" data-id="${product._id}" title="Thêm yêu thích">
          <i class="fa-regular fa-heart"></i>
        </button>
        <div class="action-icons">
          <button class="action-btn" title="Xem chi tiết" onclick="window.location.href='product.html?id=${product._id}'">
            <i class="fa-regular fa-eye"></i>
          </button>
          <button class="action-btn add-to-cart-btn" data-id="${product._id}" title="Thêm vào giỏ hàng">
            <i class="fa-solid fa-cart-shopping"></i>
          </button>

        </div>
      </div>
      <div class="card-content">
        <div class="price-wrapper">
          <span class="current-price">$${product.price.toFixed(2)}</span>
        </div>
        <h4 class="product-name">${product.name}</h4>
        <div class="rating">
          ${"★".repeat(product.rating || 4)}${"☆".repeat(5 - (product.rating || 4))}
          <span>${(product.rating || 4.33).toFixed(2)}</span>
        </div>
        <div class="store">Cửa hàng: <strong>${product.shop?.name || 'Unknown'}</strong></div>
      </div>
    </div>
  `;
  }



  async function handleFilter() {
    const checked = document.querySelectorAll(".category-filter:checked");
    const selectedIds = [...checked].map(cb => cb.value);

    container.innerHTML = "Đang lọc sản phẩm...";

    try {
      let url = "http://localhost:5000/products";
      if (selectedIds.length > 0) {
        url += `?category=${selectedIds.join(",")}`;
      }

      const res = await fetch(url);
      const result = await res.json();
      renderProducts(result.data);
    } catch (err) {
      container.innerHTML = "<p>Lỗi khi tải sản phẩm.</p>";
      console.error("Lỗi lọc sản phẩm:", err);
    }
  }

  async function loadCategorySidebar() {
    try {
      const result = await CategoryAPI.getAllCategories();
      const categories = result.data;
      const categoryList = document.querySelector(".category-filter-list");

      if (!categoryList || !categories) return;

      const html = categories.map(c => `
        <li>
          <label>
            <input type="checkbox" class="category-filter" value="${c._id}" /> ${c.name}
          </label>
        </li>
      `).join("");

      categoryList.innerHTML = html;

      document.querySelectorAll(".category-filter").forEach(cb => {
        cb.addEventListener("change", handleFilter);
      });
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  }

   function loadAllProducts() {
    container.innerHTML = "Đang tải sản phẩm...";
    ProductAPI.getAllProducts().then(res => {
      renderProducts(res.data);
      attachAddToCartEvents(); // Gắn event cho nút thêm giỏ hàng sau khi render
    }).catch(err => {
      container.innerHTML = "<p>Lỗi khi tải sản phẩm.</p>";
      console.error("Lỗi lấy sản phẩm:", err);
    });
  }
  loadCategorySidebar();
  loadAllProducts();
});
