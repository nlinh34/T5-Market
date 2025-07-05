// frontend/pages/shop/shop-manager.js
document.addEventListener("DOMContentLoaded", () => {
    // Tab switching functionality
    const tabLinks = document.querySelectorAll(".tab-link");
    
    tabLinks.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(t => t.classList.remove("active"));
            
            // Add active class to clicked tab
            e.target.classList.add("active");
            
            // Handle tab content switching
            const tabName = e.target.dataset.tab;
            handleTabSwitch(tabName);
        });
    });

    // Phone number toggle
    const phoneToggle = document.getElementById("phoneToggle");
    const phoneDisplay = document.getElementById("shopPhoneDisplay");
    const fullPhone = "0933012345"; // This should come from backend
    
    if (phoneToggle) {
        phoneToggle.addEventListener("click", (e) => {
            e.preventDefault();
            
            if (phoneDisplay.textContent.includes("***")) {
                phoneDisplay.textContent = fullPhone;
                phoneToggle.textContent = "Ẩn số";
            } else {
                phoneDisplay.textContent = fullPhone.substring(0, 5) + "***";
                phoneToggle.textContent = "Hiện số";
            }
        });
    }

    // Initialize shop data
    initializeShopData();
});

function handleTabSwitch(tabName) {
    const mainContent = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar");
    
    // Hide all content first
    mainContent.style.opacity = "0.5";
    
    setTimeout(() => {
        // Hide all content cards initially
        document.querySelectorAll(".main-content .card").forEach(card => card.style.display = "none");

        switch(tabName) {
            case "cuaHang":
                document.getElementById("shopIntroCard").style.display = "block";
                break;
            case "sanPhamDangBan":
                document.getElementById("productsForSaleCard").style.display = "block";
                loadProductsForSaleContent();
                break;
            case "danhGia":
                // document.getElementById("reviewsCard").style.display = "block"; // Assuming you have a reviews card
                loadReviewsContent();
                break;
        }
        mainContent.style.opacity = "1";
    }, 150);
}

function loadShopContent() {
    // Content already loaded by default or shown by handleTabSwitch
    console.log("Loading shop content...");
}

import { ProductAPI } from '../../APIs/productAPI.js';
import { formatCurrency, formatTimeAgo } from '../../APIs/utils/formatter.js';

async function loadProductsForSaleContent() {
    console.log("Loading products for sale content...");
    const sellerProductsGrid = document.getElementById("sellerProductsGrid");
    const noProductsMessage = document.getElementById("noProductsMessage");

    if (!sellerProductsGrid || !noProductsMessage) {
        console.error("Required elements for products for sale content not found.");
        return;
    }

    sellerProductsGrid.innerHTML = ''; // Clear existing products
    noProductsMessage.classList.add("hidden"); // Hide empty message initially

    try {
        const response = await ProductAPI.getUserProducts();
        if (response.success && response.data) {
            const { approved, pending, total } = response.data;

            // Combine approved and pending products for display if desired
            const allProducts = [...approved, ...pending];

            if (allProducts.length > 0) {
                allProducts.forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.className = "product-card";
                    productCard.innerHTML = `
                        <img src="${product.image_url}" alt="${product.name}" class="product-img">
                        <div class="product-info">
                            <div class="product-header">
                                <span class="product-status status-partner">ĐỐI TÁC</span>
                                <h4 class="product-name">${product.name}</h4>
                            </div>
                            <p class="product-price">${formatCurrency(product.price)}</p>
                            <div class="product-footer">
                                <span class="product-time"><i class="fas fa-clock"></i> ${formatTimeAgo(product.createdAt)}</span>
                                <i class="far fa-heart favorite-icon"></i>
                            </div>
                        </div>
                    `;
                    sellerProductsGrid.appendChild(productCard);
                });

            } else {
                noProductsMessage.classList.remove("hidden");
            }
        }
    } catch (error) {
        console.error("Error loading products for sale:", error);
        // Optionally display an error message to the user
        noProductsMessage.classList.remove("hidden");
        noProductsMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i><h3>Lỗi tải sản phẩm</h3><p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>`;
    }
}

async function handleEditProduct(productId) {
    console.log("Edit product with ID:", productId);
    // Redirect to product posting/editing page with product ID
    window.location.href = `/frontend/pages/products/post-products.html?id=${productId}`;
}

async function handleDeleteProduct(productId) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
        try {
            const response = await ProductAPI.deleteProduct(productId);
            if (response.success) {
                alert("Sản phẩm đã được xóa thành công!");
                loadProductsForSaleContent(); // Reload products after deletion
            } else {
                alert("Lỗi khi xóa sản phẩm: " + response.error);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Đã xảy ra lỗi khi xóa sản phẩm.");
        }
    }
}

function loadReviewsContent() {
    console.log("Loading reviews content...");
    // Implementation for reviews content
}

async function initializeShopData() {
    // This function would typically fetch data from your backend
    // For now, using static data as shown in the original code
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        // Update shop name if user data exists
        const shopNameElement = document.getElementById("shopName");
        if (shopNameElement && user.fullName) {
            shopNameElement.textContent = user.fullName + " mobile";
        }
    }
    
    // Initialize other dynamic content
    updateShopStats();
}

function updateShopStats() {
    // Update stats with real data from backend
    // This is placeholder implementation
} 