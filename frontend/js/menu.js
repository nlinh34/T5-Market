import { ProductAPI } from "../APIs/productAPI.js";
import { CategoryAPI } from "../APIs/categoryAPI.js";
import FavoriteAPI from "../APIs/favoriteAPI.js";
import CartAPI from "../APIs/cartAPI.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".product-grid");
  const paginationContainer = document.querySelector(".pagination-container");
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");
  const minPriceValue = document.getElementById("minPriceValue");
  const maxPriceValue = document.getElementById("maxPriceValue");
  const applyPriceFilterBtn = document.getElementById("applyPriceFilter");
  const fallbackImg = "https://t4.ftcdn.net/jpg/05/82/98/21/360_F_582982149_kN0XAeccaysWXvcHr4s3bhitFSVU8rlP.jpg";
  let currentPage = 1;
  const limit = 15;
  let favoriteProductIds = [];
  const loadFavorites = async () => {
    try {
      const favorites = await FavoriteAPI.getFavorites();
      favoriteProductIds = favorites.map(p => p._id);
    } catch (err) {
      console.warn("Không thể tải danh sách yêu thích:", err);
      favoriteProductIds = [];
    }
  };

  const attachFavoriteEvents = () => {
    document.querySelectorAll(".like-btn").forEach(btn => {
      btn.onclick = async () => {
        const productId = btn.dataset.id;
        const isLiked = btn.classList.contains("liked");
        try {
          if (isLiked) {
            await FavoriteAPI.removeFavorite(productId);
            btn.classList.remove("liked");
            btn.querySelector("i").classList.replace("fa-solid", "fa-regular");
          } else {
            await FavoriteAPI.addFavorite(productId);
            btn.classList.add("liked");
            btn.querySelector("i").classList.replace("fa-regular", "fa-solid");
          }
        } catch (err) {
          alert("⚠️ Vui lòng đăng nhập để sử dụng tính năng yêu thích.");
        }
      };
    });
  };

  const optimizeCloudinaryUrl = (url, width = 400) => {
    return url.includes("/upload/")
      ? url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`)
      : url;
  };

  const formatPriceVND = (price) => price.toLocaleString("vi-VN") + " đ";

  const loadPriceRange = async () => {
    try {
      const result = await ProductAPI.getPriceRange();
      const { min, max } = result;

      if (typeof min === "number" && typeof max === "number") {
        minPriceInput.min = min;
        minPriceInput.max = max;
        maxPriceInput.min = min;
        maxPriceInput.max = max;

        minPriceInput.value = 0;
        maxPriceInput.value = max;

        updatePriceValues();
      }
    } catch (err) {
      console.error("Không thể lấy khoảng giá:", err);
    }
  };

  const updatePriceValues = () => {
    minPriceValue.textContent = formatPriceVND(parseInt(minPriceInput.value));
    maxPriceValue.textContent = formatPriceVND(parseInt(maxPriceInput.value));
  };

  const validateImageUrl = (url, fallbackUrl) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(fallbackUrl);
    img.src = url;
  });

  const generateProductCard = (product, imgSrc, imgElId) => {
    const isLiked = favoriteProductIds.includes(product._id);
    const heartIcon = isLiked ? "fa-solid" : "fa-regular";
    const likedClass = isLiked ? "liked" : "";

    return `
    <div class="new-product-card">
      <div class="card-top">
        <img loading="lazy" decoding="async" fetchpriority="low" width="200" height="200" id="${imgElId}" src="${imgSrc}" alt="${product.name}" />
        <button class="like-btn ${likedClass}" data-id="${product._id}" title="Yêu thích">
          <i class="${heartIcon} fa-heart"></i>
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
        <h4 class="product-name">${product.name}</h4>
        <div class="price-wrapper">
          <span class="current-price">${product.price.toLocaleString("vi-VN")} đ</span>
        </div>
        <div class="rating">
          ${"★".repeat(product.rating || 4)}${"☆".repeat(5 - (product.rating || 4))}
          <span>${(product.rating || 4.33).toFixed(2)}</span>
        </div>
        <div class="store"><i class="fa-solid fa-store"></i> ${product.shop?.name || "Unknown"}</div>
      </div>
    </div>
  `;
  };


  const renderProducts = async (products) => {
    container.innerHTML = "";
    if (!products?.length) {
      container.innerHTML = "<p>Không có sản phẩm nào.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const product of products) {
      const imgElId = `product-img-${product._id}`;
      const imgCandidate = product.images?.[0] || fallbackImg;
      const optimizedUrl = optimizeCloudinaryUrl(imgCandidate);
      const validUrl = await validateImageUrl(optimizedUrl, fallbackImg);
      const wrapper = document.createElement("div");
      wrapper.innerHTML = generateProductCard(product, validUrl, imgElId);
      fragment.appendChild(wrapper.firstElementChild);
    }
    container.appendChild(fragment);
    attachAddToCartEvents();
    attachFavoriteEvents();
  };

  const attachAddToCartEvents = () => {
    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
      button.onclick = async () => {
        const productId = button.dataset.id;
        const token = localStorage.getItem("token");
        if (!token) return alert("⚠️ Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        try {
          const res = await CartAPI.addToCart(productId, 1);
          alert(res.success ? "✅ Đã thêm sản phẩm vào giỏ hàng!" : "❌ Thêm thất bại.");
          window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
          alert("❌ Có lỗi xảy ra khi thêm vào giỏ hàng.");
        }
      };
    });
  };

  const renderPagination = (totalPages, currentPage, isFilterMode = false) => {
    if (!paginationContainer) return;
    if (!totalPages || totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }
    paginationContainer.innerHTML = `
      <div class="pagination">
        <button id="prevPage" ${currentPage === 1 ? "disabled" : ""}>◀</button>
        <span>Trang ${currentPage} / ${totalPages}</span>
        <button id="nextPage" ${currentPage === totalPages ? "disabled" : ""}>▶</button>
      </div>`;

    document.getElementById("prevPage").onclick = () => {
      if (currentPage > 1) isFilterMode ? handleFilter(currentPage - 1) : loadAllProducts(currentPage - 1);
    };
    document.getElementById("nextPage").onclick = () => {
      if (currentPage < totalPages) isFilterMode ? handleFilter(currentPage + 1) : loadAllProducts(currentPage + 1);
    };
  };

  const handleFilter = async (page = 1) => {
    const selectedIds = [...document.querySelectorAll(".category-filter:checked")]
      .map(cb => cb.value)
      .filter(id => /^[a-f\d]{24}$/i.test(id));  // chỉ giữ ObjectId hợp lệ
    console.log("Selected categoryIds:", selectedIds);
    const minPrice = parseInt(minPriceInput.value) || 0;
    const maxPrice = parseInt(maxPriceInput.value) || 999999999;

    container.innerHTML = "🔍 Đang lọc sản phẩm...";

    try {
      const result = await ProductAPI.getAllProductsByFilter({
        category: selectedIds,
        minPrice,
        maxPrice,
        page,
        limit
      });
      const products = result.data;
      const pagination = result.pagination;

      if (!products || products.length === 0) {
        container.innerHTML = "<p>❗Không tìm thấy sản phẩm nào phù hợp.</p>";
        paginationContainer.innerHTML = "";
        return;
      }

      await renderProducts(products);
      renderPagination(pagination.totalPages || 1, page, true);
    } catch (err) {
      console.error("Lỗi khi lọc sản phẩm:", err);
      container.innerHTML = "<p>⚠️ Đã xảy ra lỗi khi lọc sản phẩm.</p>";
    }
  };


  const loadCategorySidebar = async () => {
    try {
      const result = await CategoryAPI.getAllCategories();
      const categories = result.data;
      const categoryList = document.querySelector(".category-filter-list");
      if (!categoryList || !categories) return;
      categoryList.innerHTML = categories.map(c => `
        <li>
          <label>
            <input type="checkbox" class="category-filter" value="${c._id}" /> ${c.name}
          </label>
        </li>`).join("");

      document.querySelectorAll(".category-filter").forEach(cb => cb.addEventListener("change", () => handleFilter(1)));
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  };

  const loadAllProducts = (page = 1) => {
    container.innerHTML = "Đang tải sản phẩm...";
    ProductAPI.getApprovedProducts(page, limit).then(res => {
      if (res?.data) renderProducts(res.data);
      if (res?.pagination?.totalPages) renderPagination(res.pagination.totalPages, page);
    }).catch(err => {
      container.innerHTML = "<p>Lỗi khi tải sản phẩm.</p>";
    });
  };

  minPriceInput.addEventListener("input", updatePriceValues);
  maxPriceInput.addEventListener("input", updatePriceValues);
  applyPriceFilterBtn.addEventListener("click", () => handleFilter(1));

  updatePriceValues();
  await loadPriceRange();
  await loadFavorites();
  loadCategorySidebar();
  loadAllProducts();
});
