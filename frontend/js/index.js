// frontend/pages/home/index.js
import { CategoryAPI } from "../APIs/categoryAPI.js";
import { formatDate } from "../APIs/utils/formatter.js";
import { ProductAPI } from "../APIs/productAPI.js"; // Added import for ProductAPI
import { ShopAPI } from "../APIs/shopAPI.js"; // Import ShopAPI

let currentProductsPage = 1;
const productsPerPage = 8; // Or 9, based on your local file's current state
let allApprovedProducts = []; // Biến để lưu trữ tất cả sản phẩm đã duyệt

document.addEventListener("DOMContentLoaded", function() {
    // Hàm cắt chuỗi theo số từ - DI CHUYỂN VÀO ĐÂY
    function truncateWords(text, numWords) {
        if (!text) return "N/A";
        const words = text.split(' ');
        if (words.length > numWords) {
            return words.slice(0, numWords).join(' ') + '...';
        }
        return text;
    }

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
            return "/assests/images/default-product.png"; // Changed fallback image
        }

        if (!imageURL || typeof imageURL !== "string" || imageURL.trim() === "" || imageURL === "null" || imageURL === "undefined" || !isValidImageUrl(imageURL)) {
            console.log("getValidImageURL - Returning fallback image (invalid or empty URL detected). Type: " + (typeof imageURL) + ", Value: " + imageURL);
            return "/assests/images/default-product.png"; // Changed fallback image
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
                uniqueCategories.push({...category, imageURL: validImg });
                seenImages.add(validImg);
            }
        }

        const categoriesHTML = uniqueCategories.map(category => `
            <div class="category-card">
                <img loading="lazy" src="${category.imageURL}" alt="${category.name}" class="category-img"/>
                <h3 class="category-name">${category.name}</h3>
            </div>
        `).join("");

        categoryGrid.innerHTML = categoriesHTML;
    }

    async function loadApprovedProducts(page = 1, limit = productsPerPage) {
        try {
            const grid = document.querySelector(".products-grid");
            grid.innerHTML = '<div class="loading">Đang tải sản phẩm...</div>';

            const result = await ProductAPI.getApprovedProducts(); // Use ProductAPI
            if (!result.success) throw new Error(result.error || "Lỗi khi tải sản phẩm");

            const allProducts = result.data;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const productsToRender = allProducts.slice(startIndex, endIndex);

            renderProducts(productsToRender);
            renderProductsPagination(page, allProducts.length);

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

        const html = products.map(product => {
            console.log("Product data in renderProducts:", product); // Debug log
            console.log("Shop address in renderProducts:", product && product.shop && product.shop.address); // Debug log (fixed syntax)

            const productName = truncateWords(product.name, 3);
            const sellerName = truncateWords(product.shop.name || 'N/A', 2);
            const productLocation = truncateWords(product.shop.address || 'N/A', 2);

            return `
            <div class="product-card" data-id="${product._id}">
                <img loading="lazy" src="${getValidImageURL(product.images[0])}" alt="${product.name}" class="product-img" loading="lazy"/>
                <div class="product-info">
                    <h3 class="product-name">${productName}</h3>
                    <p class="product-price">${product.price.toLocaleString()} VND</p>
                    <p class="product-posted-date">Ngày đăng: ${formatDate(product.createdAt)}</p>
                    <div class="product-seller-info">
                        <span class="seller-name-display"><i class="fas fa-user"></i> ${sellerName}</span>
                        <span class="product-location-display"><i class="fas fa-map-marker-alt"></i> ${productLocation}</span>
                    </div>
                </div>
            </div>
        `;
        }).join("");

        grid.innerHTML = html;

        document.querySelectorAll(".product-card").forEach((card) => {
            card.addEventListener("click", (e) => {
                const id = card.dataset.id;
                if (id) {
                    window.location.href = `product.html?id=${id}`;
                }
            });
        });
    }

    function renderProductsPagination(currentPage, totalProducts) {
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        document.getElementById('current-products-page').textContent = `${currentPage} / ${totalPages}`;

        const prevButton = document.getElementById('prev-products-page');
        const nextButton = document.getElementById('next-products-page');

        if (prevButton) {
            prevButton.disabled = currentPage === 1;
        }
        if (nextButton) {
            nextButton.disabled = currentPage === totalPages || totalPages === 0;
        }
    }

    document.getElementById('prev-products-page').addEventListener('click', () => {
        if (currentProductsPage > 1) {
            currentProductsPage--;
            loadApprovedProducts(currentProductsPage);
        }
    });

    document.getElementById('next-products-page').addEventListener('click', () => {
        // Need to fetch total products first to know total pages
        ProductAPI.getApprovedProducts().then(result => {
            if (result.success) {
                const totalProducts = result.data.length;
                const totalPages = Math.ceil(totalProducts / productsPerPage);
                if (currentProductsPage < totalPages) {
                    currentProductsPage++;
                    loadApprovedProducts(currentProductsPage);
                }
            }
        });
    });

    async function loadFeaturedProducts() {
        try {
            const featuredGrid = document.querySelector(".featured-grid");
            featuredGrid.innerHTML = '<div class="loading">Đang tải sản phẩm nổi bật...</div>';

            // Always use fallback to ProductAPI.getApprovedProducts, removed direct fetch to /products/featured
            const fallbackResult = await ProductAPI.getApprovedProducts(); // Use ProductAPI
            if (fallbackResult.success) {
                const featuredProducts = fallbackResult.data.slice(0, 6); // Take first 6 products as featured
                renderFeaturedProducts(featuredProducts);
            } else {
                throw new Error(fallbackResult.error || "Không thể tải sản phẩm nổi bật");
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
            const img = getValidImageURL(product.images[0]); // Changed to product.images[0]
            if (!seenImages.has(img)) {
                uniqueProducts.push({...product, image_url: img });
                seenImages.add(img);
            }
        }

        const html = uniqueProducts.map(product => {
            console.log("Product data in renderFeaturedProducts:", product); // Debug log
            console.log("Shop address in renderFeaturedProducts:", product && product.shop && product.shop.address); // Debug log (fixed syntax)

            const featuredProductName = truncateWords(product.name, 3);
            const featuredSellerName = truncateWords(product.shop.name || 'N/A', 2);
            const featuredProductLocation = truncateWords(product.shop.address || 'N/A', 2);

            return `
            <div class="featured-product-card" data-id="${product._id}">
                <div class="featured-badge">
                    <i class="fas fa-star"></i> Nổi bật
                </div>
                <img loading="lazy" src="${getValidImageURL(product.images[0])}" alt="${product.name}" class="featured-product-img" loading="lazy"/>
                <div class="featured-product-info">
                    <h3 class="featured-product-name">${featuredProductName}</h3>
                    <p class="featured-product-price">${product.price.toLocaleString()} VND</p>
                    <p class="featured-product-posted-date">Ngày đăng: ${formatDate(product.createdAt)}</p>
                    <div class="featured-product-seller-info">
                        <span class="seller-name-display"><i class="fas fa-user"></i> ${featuredSellerName}</span>
                        <span class="product-location-display"><i class="fas fa-map-marker-alt"></i> ${featuredProductLocation}</span>
                    </div>
                </div>
            </div>
        `;
        }).join("");

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

    async function loadApprovedShops() {
        try {
            const sellersGrid = document.querySelector(".sellers-grid");
            sellersGrid.innerHTML = '<div class="loading">Đang tải cửa hàng nổi bật...</div>';

            const result = await ShopAPI.getApprovedShops();

            if (result.success) {
                renderApprovedShops(result.data);
            } else {
                throw new Error(result.error || "Không thể tải danh sách cửa hàng nổi bật");
            }
        } catch (error) {
            console.error("Lỗi tải cửa hàng nổi bật:", error);
            document.querySelector(".sellers-grid").innerHTML = `
                <div class="error-message">
                    Không thể tải cửa hàng nổi bật. Vui lòng thử lại sau!
                </div>
            `;
        }
    }

    function renderApprovedShops(shops) {
        const sellersGrid = document.querySelector(".sellers-grid");
        sellersGrid.innerHTML = "";

        if (!shops || shops.length === 0) {
            sellersGrid.innerHTML = "<p>Không có cửa hàng nổi bật nào.</p>";
            return;
        }

        const html = shops.slice(0, 3).map(shop => `
            <div class="seller-card">
                <img loading="lazy" src="${shop.logoUrl || './assests/images/default-product.png'}" alt="${shop.name}" class="seller-avatar" />
                <div class="seller-details-group">
                    <div class="seller-name-row">
                        <h3 class="seller-name">${shop.name}</h3>
                        <span class="seller-status-circle ${shop.status === 'approved' ? 'active' : 'inactive'}"></span>
                    </div>
                    <p class="seller-rating"><i class="fas fa-star"></i> <span>${shop.rating ? shop.rating.toFixed(1) : 'Chưa có'} sao (${shop.reviewCount || 0} đánh giá)</span></p>
                </div>
            </div>
        `).join("");

        sellersGrid.innerHTML = html;
    }

    loadCategories();
    loadApprovedProducts(currentProductsPage); // Initial call with currentProductsPage
    loadFeaturedProducts();
    loadApprovedShops(); // Call the new function to load approved shops
});