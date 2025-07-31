import { ProductAPI } from "../APIs/productAPI.js";
import { CategoryAPI } from "../APIs/categoryAPI.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".product-grid");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const slider = document.querySelector('.ad-slider');
  const slides = document.querySelectorAll('.ad-slide');
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");
  const minPriceValue = document.getElementById("minPriceValue");
  const maxPriceValue = document.getElementById("maxPriceValue");
  const applyPriceFilterBtn = document.getElementById("applyPriceFilter");
  let currentIndex = 0;

  function formatPriceVND(price) {
    return price.toLocaleString('vi-VN') + ' VND';
  }

  function updatePriceValues() {
    minPriceValue.textContent = formatPriceVND(parseInt(minPriceInput.value));
    maxPriceValue.textContent = formatPriceVND(parseInt(maxPriceInput.value));
  }

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

  function renderProducts(products) {
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
          <button class="action-btn" title="Thêm vào giỏ hàng" onclick="window.location.href='../cart/cart.html?id=${product._id}'">
            <i class="fa-solid fa-cart-shopping"></i>
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="price-wrapper">
          <span class="current-price">${formatPriceVND(product.price)}</span>
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
    const minPrice = parseInt(minPriceInput.value);
    const maxPrice = parseInt(maxPriceInput.value);

    container.innerHTML = "Đang lọc sản phẩm...";
    try {
      const result = await ProductAPI.getAllProductsByFilter({
        categoryIds: selectedIds,
        minPrice: minPrice,
        maxPrice: maxPrice
      });
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
            <input type="checkbox" class="category-filter" value="${c._id}" />
            <span>${c.name}</span>
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
    }).catch(err => {
      container.innerHTML = "<p>Lỗi khi tải sản phẩm.</p>";
      console.error("Lỗi lấy sản phẩm:", err);
    });
  }

  // Cập nhật giá trị hiển thị khi thay đổi range
  minPriceInput.addEventListener("input", updatePriceValues);
  maxPriceInput.addEventListener("input", updatePriceValues);

  // Xử lý sự kiện khi nhấn nút áp dụng
  applyPriceFilterBtn.addEventListener("click", handleFilter);

  // Khởi tạo giá trị hiển thị ban đầu
  updatePriceValues();

  loadCategorySidebar();
  loadAllProducts();
});