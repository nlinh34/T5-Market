import { CategoryAPI } from "../APIs/categoryAPI.js";
import FavoriteAPI from "../APIs/favoriteAPI.js";
import { formatCurrency } from "../APIs/utils/formatter.js";

document.addEventListener("DOMContentLoaded", async () => {
  const favoritesGrid = document.getElementById("favorites-grid");
  const emptyState = document.getElementById("empty-state");
  const favoritesTotal = document.getElementById("favorites-total");

  try {
    // Lấy danh sách sản phẩm yêu thích từ API
    const favoriteProducts = await FavoriteAPI.getFavorites();
    console.log("📦 favoriteProducts:", favoriteProducts);
    // Cập nhật tổng số sản phẩm yêu thích
    favoritesTotal.textContent = favoriteProducts.length;

    // Nếu không có sản phẩm nào thì hiện trạng thái rỗng
    if (favoriteProducts.length === 0) {
      favoritesGrid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    // Nếu có sản phẩm, ẩn trạng thái rỗng
    emptyState.style.display = "none";

    // Render danh sách sản phẩm
    renderFavorites(favoriteProducts);
  } catch (err) {
    console.error("Lỗi khi tải danh sách yêu thích:", err.message);
  }

  function renderFavorites(products) {
    favoritesGrid.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "new-product-card";
      console.log(product)
      const isLiked = true; // Vì đang ở trang yêu thích, luôn là true
      const heartIcon = isLiked ? "fa-solid" : "fa-regular";
      const likedClass = isLiked ? "liked" : "";

      card.innerHTML = `
      <div class="card-top">
        <img loading="lazy" decoding="async" fetchpriority="low" width="200" height="200" 
          src="${product.images?.[0] || '/images/no-image.png'}" 
          alt="${product.name}" />
        
        <button class="like-btn ${likedClass}" data-product-id="${product._id}" title="Bỏ yêu thích">
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
          <span class="current-price">${formatCurrency(product.price)}</span>
        </div>

        <div class="rating">
          ${"★".repeat(product.rating || 4)}${"☆".repeat(5 - (product.rating || 4))}
          <span>${(product.rating || 4.33).toFixed(2)}</span>
        </div>

        <div class="store">
          <i class="fa-solid fa-store"></i> ${product.shop?.name || "Không rõ"}
        </div>
      </div>
    `;

      favoritesGrid.appendChild(card);
    });

    attachUnfavoriteEvents();
  }


  function attachUnfavoriteEvents() {
    const likeButtons = document.querySelectorAll(".like-btn");

    likeButtons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const productId = btn.dataset.productId;
        try {
          await FavoriteAPI.removeFavorite(productId);

          // Xóa sản phẩm khỏi DOM
          const productCard = btn.closest(".new-product-card");
          productCard.remove();

          // Cập nhật tổng số
          const currentTotal = document.querySelectorAll(".new-product-card").length;
          favoritesTotal.textContent = currentTotal;

          // Hiện trạng thái rỗng nếu hết sản phẩm
          if (currentTotal === 0) {
            emptyState.style.display = "block";
          }
        } catch (err) {
          console.error("Lỗi khi bỏ yêu thích:", err.message);
        }
      });
    });
  }
});
