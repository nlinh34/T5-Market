// frontend/pages/home/index.js
import { CategoryAPI } from "../APIs/categoryAPI.js";
import { formatDate } from "../APIs/utils/formatter.js"

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded, starting to load categories...");

    async function addToCart(productId) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            return;
        }

        try {
            const res = await fetch("https://t5-market.onrender.com/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ product_id: productId, quantity: 1 })
            });

            const result = await res.json();
            if (result.success) {
                alert("✅ Đã thêm vào giỏ hàng!");
            } else {
                alert("❌ Lỗi khi thêm vào giỏ: " + (result.error || "Không xác định"));
            }
        } catch (err) {
            console.error("Lỗi fetch:", err);
            alert("Đã xảy ra lỗi khi thêm vào giỏ hàng.");
        }
    }

    async function loadCategories() {
        try {
            console.log("Loading categories...");
            const categoryGrid = document.querySelector(".category-grid");
            if (!categoryGrid) {
                console.error("Category grid not found!");
                return;
            }

            categoryGrid.innerHTML = '<div class="loading">Đang tải danh mục...</div>';

            const result = await CategoryAPI.getAllCategories();
            console.log("API result:", result);

            if (result.success) {
                renderCategories(result.data);
            } else {
                throw new Error(result.message || "Không thể tải danh sách danh mục");
            }
        } catch (error) {
            console.error("Error loading categories:", error);
            const categoryGrid = document.querySelector(".category-grid");
            if (categoryGrid) {
                categoryGrid.innerHTML = `
                    <div class="error-message">
                        Không thể tải danh mục. Vui lòng thử lại sau!<br>
                        Error: ${error.message}
                    </div>
                `;
            }
        }
    }

    function getValidImageURL(imageURL) {
        console.log("getValidImageURL - Input imageURL:", imageURL);
        // Check for specific problematic external image sources and replace with fallback
        if (imageURL && (imageURL.includes("bing.com/images") || imageURL.includes("via.placeholder.com"))) {
            console.log("getValidImageURL - Replacing problematic external URL with fallback.");
            return "/assests/images/phukien.png";
        }

        if (!imageURL || typeof imageURL !== "string" || imageURL.trim() === "" || imageURL === "null" || imageURL === "undefined" || !isValidImageUrl(imageURL)) {
            console.log("getValidImageURL - Returning fallback image (invalid or empty URL detected). Type: " + (typeof imageURL) + ", Value: " + imageURL);
            return "/assests/images/phukien.png";
        }
        console.log("getValidImageURL - Returning valid image URL:", imageURL);
        return imageURL;
    }

    // Helper function to validate image URLs (including data URIs)
    function isValidImageUrl(url) {
        if (!url || typeof url !== "string" || url.trim() === "") {
            return false; // Handle empty or non-string URLs upfront
        }

        if (url.startsWith("data:")) {
            const commaIndex = url.indexOf(',');
            if (commaIndex === -1) return false; // Must have a comma

            const mimeTypePart = url.substring(5, commaIndex);
            const dataPart = url.substring(commaIndex + 1);

            if (!mimeTypePart.startsWith('image/')) {
                return false;
            }

            if (mimeTypePart.includes('base64')) {
                if (dataPart.length === 0) return false;
                const base64ContentRegex = /^[A-Za-z0-9+/=]*$/;
                if (!base64ContentRegex.test(dataPart)) {
                    return false;
                }
                if (dataPart.length % 4 !== 0) {
                    return false;
                }
            } else {
                if (dataPart.length === 0) return false;
            }
            return true; // Valid data URL
        }

        // For non-data URLs, check if it's a valid standard URL or an internal path
        try {
            new URL(url);
            return true; // It's a valid standard URL (http, https, etc.) or a valid relative URL for URL constructor if base is implicitly set
        } catch (e) {
            // The URL constructor might fail for relative paths without a base URL,
            // or for malformed absolute URLs. We consider internal relative/absolute paths valid.
            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
                return true; // Assume internal relative/absolute paths are valid
            }
            return false; // Otherwise, it's a truly invalid URL (e.g., malformed http/https, or some other broken string)
        }
    }

    function renderCategories(categories) {
        const categoryGrid = document.querySelector(".category-grid");

        if (!categories || categories.length === 0) {
            categoryGrid.innerHTML = `
                <div class="no-categories">
                    Hiện chưa có danh mục nào.
                </div>
            `;
            return;
        }

        const uniqueCategories = [];
        const seenImages = new Set();
        for (const category of categories) {
            const validImg = getValidImageURL(category.imageURL);
            if (!seenImages.has(validImg)) {
                uniqueCategories.push({ ...category, imageURL: validImg });
                seenImages.add(validImg);
            }
        }

        const categoriesHTML = uniqueCategories.map(category => `
            <div class="category-card">
                <img src="${category.imageURL}" alt="${category.name}" class="category-img"/>
                <h3 class="category-name">${category.name}</h3>
            </div>
        `).join("");

        categoryGrid.innerHTML = categoriesHTML;
    }

    async function loadApprovedProducts() {
        try {
            const grid = document.querySelector(".products-grid");
            grid.innerHTML = '<div class="loading">Đang tải sản phẩm...</div>';

            const response = await fetch("https://t5-market.onrender.com/products/approved");
            if (!response.ok) throw new Error("Lỗi khi tải sản phẩm");

            const result = await response.json();
            renderProducts(result.data);
        } catch (error) {
            console.error("Lỗi tải sản phẩm:", error);
            document.querySelector(".products-grid").innerHTML = `
                <div class="error-message">
                    Không thể tải sản phẩm. Vui lòng thử lại sau!
                </div>
            `;
        }
    }

    function renderProducts(products) {
        const grid = document.querySelector(".products-grid");
        grid.innerHTML = "";

        if (!products || products.length === 0) {
            grid.innerHTML = "<p>Không có sản phẩm nào.</p>";
            return;
        }

        const uniqueProducts = [];
        const seenImages = new Set();
        for (const product of products) {
            const img = getValidImageURL(product.image_url);
            if (!seenImages.has(img)) {
                uniqueProducts.push({ ...product, image_url: img });
                seenImages.add(img);
            }
        }

        const html = uniqueProducts.map(product => `
            <div class="product-card" data-id="${product._id}">
                <img src="${getValidImageURL(product.image_url)}" alt="${product.name}" class="product-img" loading="lazy"/>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString()} VND</p>
                <p class="product-posted-date">Ngày đăng: ${formatDate(product.createdAt)}</p>
                <div class="product-seller-info">
                    <span class="seller-name-display"><i class="fas fa-user"></i> ${product.seller.fullName || 'N/A'}</span>
                    <span class="product-location-display"><i class="fas fa-map-marker-alt"></i> ${product.seller.address || 'N/A'}</span>
                </div>
            </div>
        `).join("");

        grid.innerHTML = html;

        document.querySelectorAll(".product-card").forEach((card) => {
            card.addEventListener("click", (e) => {
                // Ensure the click isn't from a nested interactive element if any were re-added
                const id = card.dataset.id;
                if (id) {
                    window.location.href = `product.html?id=${id}`;
                }
            });
        });
    }

    async function loadFeaturedProducts() {
        try {
            const featuredGrid = document.querySelector(".featured-grid");
            featuredGrid.innerHTML = '<div class="loading">Đang tải sản phẩm nổi bật...</div>';

            const response = await fetch("https://t5-market.onrender.com/products/featured");
            if (!response.ok) throw new Error("Lỗi khi tải sản phẩm nổi bật");

            const result = await response.json();

            if (result.success) {
                renderFeaturedProducts(result.data);
            } else {
                const fallbackResponse = await fetch("https://t5-market.onrender.com/products/approved");
                if (fallbackResponse.ok) {
                    const fallbackResult = await fallbackResponse.json();
                    const featuredProducts = fallbackResult.data.slice(0, 6);
                    renderFeaturedProducts(featuredProducts);
                } else {
                    throw new Error("Không thể tải sản phẩm nổi bật");
                }
            }
        } catch (error) {
            console.error("Lỗi tải sản phẩm nổi bật:", error);
            document.querySelector(".featured-grid").innerHTML = `
                <div class="error-message">
                    Không thể tải sản phẩm nổi bật. Vui lòng thử lại sau!
                </div>
            `;
        }
    }

    function renderFeaturedProducts(products) {
        const featuredGrid = document.querySelector(".featured-grid");
        featuredGrid.innerHTML = "";

        if (!products || products.length === 0) {
            featuredGrid.innerHTML = `
                <div class="no-featured-products">
                    <p>Hiện chưa có sản phẩm nổi bật nào.</p>
                </div>
            `;
            return;
        }

        const uniqueProducts = [];
        const seenImages = new Set();
        for (const product of products) {
            const img = getValidImageURL(product.image_url);
            if (!seenImages.has(img)) {
                uniqueProducts.push({ ...product, image_url: img });
                seenImages.add(img);
            }
        }

        const html = uniqueProducts.map(product => `
            <div class="featured-product-card" data-id="${product._id}">
                <div class="featured-badge">
                    <i class="fas fa-star"></i> Nổi bật
                </div>
                <img src="${getValidImageURL(product.image_url)}" alt="${product.name}" class="featured-product-img" loading="lazy"/>
                <div class="featured-product-info">
                    <h3 class="featured-product-name">${product.name}</h3>
                    <p class="featured-product-price">${product.price.toLocaleString()} VND</p>
                    <p class="featured-product-posted-date">Ngày đăng: ${formatDate(product.createdAt)}</p>
                    <div class="featured-product-seller-info">
                        <span class="seller-name-display"><i class="fas fa-user"></i> ${product.seller.fullName || 'N/A'}</span>
                        <span class="product-location-display"><i class="fas fa-map-marker-alt"></i> ${product.seller.address || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join("");

        featuredGrid.innerHTML = html;
        document.querySelectorAll(".featured-product-card").forEach((card) => {
            card.addEventListener("click", (e) => {
                const id = card.dataset.id;
                if (id) {
                    window.location.href = `/pages/detail-product/product.html?id=${id}`;
                }
            });
        });
    }

    loadCategories();
    loadApprovedProducts();
    loadFeaturedProducts();
});