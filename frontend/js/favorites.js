import { CategoryAPI } from "../APIs/categoryAPI.js";

document.addEventListener("DOMContentLoaded", async () => {
  const favoritesGrid = document.getElementById("favorites-grid");
  const emptyState = document.getElementById("empty-state");
  const favoritesTotal = document.getElementById("favorites-total");
  const sortSelect = document.getElementById("sort-by");
  const categorySelect = document.getElementById("category-filter");
  const clearFiltersBtn = document.getElementById("clear-filters");

  let allFavorites = [];

  // Load danh mục từ DB
  await loadCategories();

  // Lấy ID yêu thích từ localStorage
  const favoriteIds = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favoriteIds.length === 0) {
    favoritesGrid.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/products/approved");
    const result = await res.json();
    const allProducts = result.data;

    allFavorites = allProducts.filter(p => favoriteIds.includes(p._id));
    favoritesTotal.textContent = allFavorites.length;
    renderFavorites(allFavorites);
  } catch (err) {
    favoritesGrid.innerHTML = "<p>Lỗi khi tải sản phẩm.</p>";
    console.error("Lỗi tải sản phẩm yêu thích:", err);
  }

  // ========== Bộ lọc ==========
  sortSelect.addEventListener("change", () => {
    const sorted = sortFavorites(allFavorites, sortSelect.value);
    renderFavorites(sorted);
  });

  categorySelect.addEventListener("change", () => {
    const filtered = filterByCategory(allFavorites, categorySelect.value);
    renderFavorites(filtered);
  });

  clearFiltersBtn.addEventListener("click", () => {
    sortSelect.value = "newest";
    categorySelect.value = "all";
    renderFavorites(allFavorites);
  });

  // ========== Danh mục thật ==========
  async function loadCategories() {
    categorySelect.innerHTML = `<option value="all">Tất cả danh mục</option>`;
    try {
      const res = await CategoryAPI.getAllCategories();
      const categories = res.data;

      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat._id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  }

  // ========== Render ==========
  function renderFavorites(products) {
    if (!products || products.length === 0) {
      favoritesGrid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    const html = products.map(p => `
      <div class="favorite-card">
        <img src="${p.image_url}" alt="${p.name}" class="favorite-image" />
        <div class="favorite-info">
          <h3 class="favorite-name">${p.name}</h3>
          <div class="favorite-price">${formatPrice(p.price)}</div>
          <div class="favorite-actions">
            <button class="action-btn add-to-cart-btn" data-id="${p._id}">
              <i class="fas fa-cart-plus"></i> 
            </button>
            <button class="action-btn remove-favorite-btn" data-id="${p._id}">
              <i class="fas fa-heart"></i> 
            </button>
          </div>
        </div>
      </div>
    `).join("");

    favoritesGrid.innerHTML = html;

    document.querySelectorAll(".remove-favorite-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        removeFromFavorites(id);
      });
    });

    document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        addToCart(id);
      });
    });
  }

  function sortFavorites(data, type) {
    const sorted = [...data];
    switch (type) {
      case "newest":
        return sorted.reverse();
      case "oldest":
        return sorted;
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  }

  function filterByCategory(data, category) {
    if (category === "all") return data;
    return data.filter(p => p.category === category);
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price).replace("₫", "đ");
  }

  function removeFromFavorites(id) {
    if (!confirm("Bạn có chắc muốn bỏ yêu thích sản phẩm này không?")) return;
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(item => item !== id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    window.location.reload();
  }

  function addToCart(id) {
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  }
});
