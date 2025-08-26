import { ProductAPI } from "../APIs/productAPI.js";
import CartAPI from "../APIs/cartAPI.js";
import FavoriteAPI from "../APIs/favoriteAPI.js";
import { ReviewAPI } from "../APIs/reviewAPI.js";

document.addEventListener('DOMContentLoaded', async function () {
    const pageLoader = document.getElementById('page-loader');
    const pageContainer = document.querySelector('.container');
    const productDetail = document.getElementById('productDetail');

    let favoriteProductIds = [];

    // Function to show loading
    function showLoading() {
        if (pageLoader) {
            pageLoader.style.display = 'flex';
        }
        if (pageContainer) {
            pageContainer.style.visibility = 'hidden';
        }
    }

    // Function to hide loading
    function hideLoading() {
        if (pageLoader) {
            pageLoader.style.opacity = '0';
            setTimeout(() => {
                pageLoader.style.display = 'none';
            }, 300);
        }
        if (pageContainer) {
            pageContainer.style.visibility = 'visible';
        }
    }

    // Function to show error state
    function showError(message) {
        if (pageContainer) {
            pageContainer.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2>Đã xảy ra lỗi</h2>
                    <p>${message}</p>
                    <a href="./index.html" class="btn btn-primary" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; margin-top: 20px; display: inline-block;">Quay lại trang chủ</a>
                </div>
            `;
        }
        hideLoading();
    }

    // Load favorites in background
    const loadFavorites = async () => {
        try {
            const favorites = await FavoriteAPI.getFavorites();
            favoriteProductIds = favorites.map(p => p._id);
        } catch (err) {
            console.warn("Không thể tải danh sách yêu thích:", err);
            favoriteProductIds = [];
        }
    };

    // Function to get product ID from URL
    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        return /^[0-9a-fA-F]{24}$/.test(id) ? id : null;
    }

    // Function to fetch product data with timeout
    async function fetchProductData(productId) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
            const response = await fetch(`https://t5-market.onrender.com/products/${productId}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error('Failed to fetch product data');
            const result = await response.json();
            if (!result.success) throw new Error('API returned unsuccessful response');
            return result.data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - vui lòng thử lại');
            }
            console.error('Error fetching product data:', error);
            throw error;
        }
    }

    // Function to format price in VND
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
    }

    // Function to calculate days ago
    function daysAgo(dateString) {
        const createdDate = new Date(dateString);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }

    // Function to display "Product Not Found" card
    function displayNotFoundCard() {
        if (pageContainer) {
            pageContainer.innerHTML = `
                <div class="product-not-found" style="text-align: center; padding: 50px;">
                    <h2>Sản phẩm không tồn tại</h2>
                    <p>Xin lỗi, sản phẩm bạn tìm kiếm không có trong hệ thống. Vui lòng kiểm tra lại hoặc xem các sản phẩm khác.</p>
                    <a href="./index.html" class="btn btn-primary" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Quay lại trang chủ</a>
                </div>
            `;
        }
    }

    function updateProductUI(data) {
        if (!data) {
            displayNotFoundCard();
            return;
        }

        // Update page title
        document.title = `${data.name} - T5 Market`;
        const images = data.images || [];
        let currentImageIndex = 0;

        const mainImage = document.getElementById("mainImage");
        const imageIndexEl = document.getElementById("imageIndex");
        const prevBtn = document.getElementById("prevImage");
        const nextBtn = document.getElementById("nextImage");
        const thumbnailContainer = document.getElementById("thumbnailContainer");

        // Load ảnh đầu tiên
        if (images.length > 0) {
            mainImage.src = images[0];
            imageIndexEl.textContent = `1/${images.length}`;
        }

        // Tạo thumbnails
        thumbnailContainer.innerHTML = images.map((img, index) => `
            <img loading="lazy" src="${img}" data-index="${index}" class="product-thumbnail ${index === 0 ? 'active' : ''}" />
        `).join("");

        // Click thumbnail
        thumbnailContainer.querySelectorAll(".product-thumbnail").forEach(img => {
            img.addEventListener("click", () => {
                currentImageIndex = parseInt(img.getAttribute("data-index"));
                updateMainImage();
            });
        });

        // Nút trái/phải
        prevBtn.addEventListener("click", () => {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                updateMainImage();
            }
        });

        nextBtn.addEventListener("click", () => {
            if (currentImageIndex < images.length - 1) {
                currentImageIndex++;
                updateMainImage();
            }
        });

        function updateMainImage() {
            mainImage.src = images[currentImageIndex];
            imageIndexEl.textContent = `${currentImageIndex + 1}/${images.length}`;
            thumbnailContainer.querySelectorAll(".product-thumbnail").forEach((img, idx) => {
                img.classList.toggle("active", idx === currentImageIndex);
            });
        }

        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <div class="container">
                <a href="./index.html">Trang chủ</a> › 
                <span>${data.category.name}</span> › 
                <span><strong>${data.name}</strong></span>
                </div>
            `;
        }

        // Update product name
        document.querySelector(".product-title").textContent = data.name;
        document.querySelector('.product-category').innerHTML = `
            <span class="pro-category">• ${data.category.name}</span>
        `;

        // Update product meta (price, stock, location, time)
        const isLiked = favoriteProductIds.includes(data._id);
        const heartIcon = isLiked ? "fa-solid" : "fa-regular";
        const likedClass = isLiked ? "liked" : "";
        const productMeta = document.querySelectorAll('.product-meta');
        
        productMeta[0].innerHTML = `
            <span class="current-price">${formatPrice(data.price)}</span>
            <span class="stock ${data.isAvailable ? 'in-stock' : 'out-of-stock'}">
                <i class="fas fa-${data.isAvailable ? 'check-circle' : 'times-circle'}"></i>
                ${data.isAvailable ? 'Còn hàng' : 'Hết hàng'}
            </span>
        `;
        
        productMeta[1].innerHTML = `
            <span class="location"><i class="fas fa-map-marker-alt"></i> ${data.shop.address}</span>
        `;
        
        productMeta[2].innerHTML = `
            <div>
                <span class="time"><i class="fas fa-clock"></i> Đăng ${daysAgo(data.createdAt)} ngày trước</span>
                <div class="btn-product" >
                    <button class="btn buy-now add-to-cart-btn" data-id="${data._id}">Thêm vào giỏ hàng</button>
                    <button class="like-main-btn ${likedClass}" data-id="${data._id}" title="Yêu thích">
                        <i class="${heartIcon} fa-heart"></i>
                    </button>           
                </div>
            </div>
        `;

        // Update seller info
        const sellerInfo = document.querySelector('.seller-info');
        const joinDate = data.shop.createdAt || data.shop.joinDate;
        const daysJoined = joinDate ? daysAgo(joinDate) : 'N/A';
        sellerInfo.querySelector('.seller-name').textContent = data.shop.name;
        const statusEl = sellerInfo.querySelector('.seller-status');
        if (data.shop.status === "approved") {
            statusEl.innerHTML = `<i class="fas fa-check-circle" style="color: green; margin-right: 5px;"></i>`;
        } else {
            statusEl.textContent = "";
        }
        sellerInfo.querySelector('.seller-meta').innerHTML = `
            <span><i class="fas fa-box-open"></i> 12 sản phẩm</span>
            <span><i class="fas fa-star"></i> ${data.averageRating ? data.averageRating.toFixed(1) : '0'} (${data.totalReviews} đánh giá)</span>
            <span><i class="fas fa-clock"></i> Tham gia ${daysJoined} ngày trước</span>
        `;
        sellerInfo.querySelector('.seller-avatar img').src = data.shop.logoUrl || './images/avatar/default-avatar.jpg';
        sellerInfo.querySelector('.seller-actions').innerHTML = `
            <button class="btn btn-primary" style="background: green" onclick="window.location.href='shop.html?id=${data.shop._id}'">Xem cửa hàng</button>
            <button class="btn-report">Báo cáo</button>
        `;

        // Update product description
        const descriptionTab = document.querySelector('#product-description');
        descriptionTab.innerHTML = `
            <h3>${data.name}</h3>
            <p>${data.description}</p>
        `;
    }

    // Initialize page
    async function initializePage() {
        showLoading();

        try {
            // Load favorites in background (non-blocking)
            const favoritesPromise = loadFavorites();

            // Get product ID and validate
            const productId = getProductIdFromUrl();
            if (!productId) {
                displayNotFoundCard();
                hideLoading();
                return;
            }

            // Fetch product data with timeout
            const productData = await fetchProductData(productId);
            
            // Wait for favorites to load
            await favoritesPromise;

            if (!productData) {
                displayNotFoundCard();
                hideLoading();
                return;
            }

            // Preload product images for better performance
            if (productData.images && productData.images.length > 0) {
                productData.images.forEach(imgSrc => {
                    const img = new Image();
                    img.src = imgSrc;
                });
            }

            // Update UI with product data
            updateProductUI(productData);

            // Load additional data in parallel
            const loadPromises = [
                loadReviews(productId),
                loadOtherProductsFromShop(productData.shop._id, productData._id),
                loadSimilarProducts(productData.category._id, productData._id)
            ];

            // Update seller title
            const sellerTitle = document.querySelector(".seller-products .section-title");
            if (sellerTitle && productData?.shop?.name) {
                sellerTitle.textContent = `Sản phẩm khác của ${productData.shop.name}`;
            }

            // Wait for all data to load
            await Promise.allSettled(loadPromises);

            // Setup lazy loading for images
            setupLazyLoading();

            // Hide loading and show content
            hideLoading();

        } catch (error) {
            console.error('Error initializing page:', error);
            showError(error.message || 'Đã xảy ra lỗi khi tải dữ liệu sản phẩm');
        }
    }

    // Setup lazy loading for images
    function setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Initialize the page
    await initializePage();

    // Tab switching functionality
    const productTabHeaders = document.querySelectorAll('.tabs-header-product li');
    const productTabPanes = document.querySelectorAll('.tabs-content-product .tab-pane');

    productTabHeaders.forEach((header) => {
        header.addEventListener('click', function () {
            productTabHeaders.forEach(h => h.classList.remove('active'));
            productTabPanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });

    const reviewTabHeaders = document.querySelectorAll('.tabs-header-review li');
    const reviewTabPanes = document.querySelectorAll('.tabs-content-review .tab-pane');

    reviewTabHeaders.forEach((header) => {
        header.addEventListener('click', function () {
            reviewTabHeaders.forEach(h => h.classList.remove('active'));
            reviewTabPanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });

    // Load and display reviews
    async function loadReviews(productId) {
        const reviewListDiv = document.querySelector('#description .review-list');
        if (!reviewListDiv) return;

        reviewListDiv.innerHTML = '<p>Đang tải đánh giá...</p>';

        try {
            const res = await ReviewAPI.getReviewsByProduct(productId);
            if (!res.success || !Array.isArray(res.data) || res.data.length === 0) {
                reviewListDiv.innerHTML = '<p>Chưa có đánh giá nào cho sản phẩm này.</p>';
                return;
            }

            reviewListDiv.innerHTML = res.data.map(review => `
                <div class="review-item">
                    <div class="reviewer-avatar">
                        <img loading="lazy" src="./assets/images/avatar/default-avatar.jpg" alt="${review.user?.fullName || 'Người dùng'}">
                    </div>
                    <div class="review-content-container">
                        <div class="reviewer-name">${review.user?.fullName || 'Người dùng ẩn danh'}</div>
                        <div class="review-meta-info">
                            <div class="review-rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
                            <span class="review-date"> | ${formatDate(review.createdAt)}</span>
                        </div>
                        <p class="review-comment-text">${review.comment || 'Không có bình luận.'}</p>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Lỗi khi tải đánh giá:', error);
            reviewListDiv.innerHTML = '<p>Không thể tải đánh giá.</p>';
        }
    }

    // Load other products from the same shop
    async function loadOtherProductsFromShop(shopId, currentProductId) {
        const grid = document.querySelector(".seller-products .products-grid");
        if (!grid) return;

        try {
            const res = await ProductAPI.getApprovedProductsByShopId(shopId);
            if (!res.success || !Array.isArray(res.data)) {
                grid.innerHTML = "<p>Không có sản phẩm nào để hiển thị.</p>";
                return;
            }

            // Filter out current product
            const otherProducts = res.data.filter(p => p._id !== currentProductId);
            if (otherProducts.length === 0) {
                grid.innerHTML = "<p>Người bán không có sản phẩm nào khác.</p>";
                return;
            }

            // Display other products
            grid.innerHTML = otherProducts.map(product => {
                const isLiked = favoriteProductIds.includes(product._id);
                const likedClass = isLiked ? "liked" : "";
                const heartIcon = isLiked ? "fa-solid" : "fa-regular";

                return `
                    <div class="new-product-card">
                        <div class="card-top">
                            <img loading="lazy" src="${product.images?.[0] || './assets/images/default-product.jpg'}" alt="${product.name}" />
                            <button class="like-btn ${likedClass}" data-id="${product._id}" title="Thêm yêu thích">
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
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <div class="price-wrapper">
                                <span class="current-price-card">${product.price.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div class="rating">
                                ${"★".repeat(product.rating || 4)}${"☆".repeat(5 - (product.rating || 4))}
                                <span>${(product.rating || 4.33).toFixed(2)}</span>
                            </div>
                            <div class="store">Cửa hàng: <strong>${product.shop?.name || 'Unknown'}</strong></div>
                        </div>
                    </div>
                `;
            }).join("");

        } catch (error) {
            console.error("Lỗi khi tải sản phẩm khác từ shop:", error);
            grid.innerHTML = "<p>Không thể tải sản phẩm từ người bán.</p>";
        }
    }

    // Load similar products by category
    async function loadSimilarProducts(categoryId, currentProductId) {
        const container = document.querySelector(".related-products .products-grid");
        if (!container) return;

        try {
            // Use filtered products API with category filter
            const res = await ProductAPI.getAllProductsByFilter({ 
                category: [categoryId], 
                page: 1, 
                limit: 8 
            });
            
            if (!res.success || !Array.isArray(res.data)) {
                container.innerHTML = "<p>Không có sản phẩm tương tự để hiển thị.</p>";
                return;
            }

            const similarProducts = res.data.filter(p => p._id !== currentProductId);
            if (similarProducts.length === 0) {
                container.innerHTML = "<p>Không tìm thấy sản phẩm tương tự.</p>";
                return;
            }

            container.innerHTML = similarProducts.map(product => {
                const isLiked = favoriteProductIds.includes(product._id);
                const likedClass = isLiked ? "liked" : "";
                const heartIcon = isLiked ? "fa-solid" : "fa-regular";

                return `
                    <div class="new-product-card">
                        <div class="card-top">
                            <img loading="lazy" src="${product.images?.[0] || './assets/images/default-product.jpg'}" alt="${product.name}" />
                            <button class="like-btn ${likedClass}" data-id="${product._id}" title="Thêm yêu thích">
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
                        <div class="product-info">
                            <h4 class="product-name">${product.name}</h4>
                            <div class="price-wrapper">
                                <span class="current-price">${formatPrice(product.price)}</span>
                            </div>
                            <div class="rating">
                                ${"★".repeat(product.rating || 4)}${"☆".repeat(5 - (product.rating || 4))}
                                <span>${(product.rating || 4.3).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

        } catch (error) {
            console.error("Lỗi khi tải sản phẩm tương tự:", error);
            container.innerHTML = "<p>Không thể tải sản phẩm tương tự.</p>";
        }
    }

    // Toggle favorite functionality
    async function toggleFavorite(button) {
        const productId = button.dataset.id;
        const icon = button.querySelector("i");

        if (!productId || !icon) return;

        try {
            if (button.classList.contains("liked")) {
                await FavoriteAPI.removeFavorite(productId);
                button.classList.remove("liked");
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");
            } else {
                try {
                    await FavoriteAPI.addFavorite(productId);
                } catch (err) {
                    if (!err.message?.includes("nằm trong danh sách yêu thích")) throw err;
                }
                button.classList.add("liked");
                icon.classList.remove("fa-regular");
                icon.classList.add("fa-solid");
            }
        } catch (error) {
            console.error("Lỗi xử lý yêu thích:", error);
            alert("❌ Thao tác thất bại, vui lòng thử lại!");
        }
    }

    // Global event listeners for interactive elements
    let isAdding = false;

    document.addEventListener("click", async (e) => {
        const likeBtn = e.target.closest(".like-main-btn, .like-btn");
        if (likeBtn) {
            e.preventDefault();
            await toggleFavorite(likeBtn);
            return;
        }

        const addToCartBtn = e.target.closest(".add-to-cart-btn");
        if (addToCartBtn) {
            if (isAdding) return;

            isAdding = true;
            e.preventDefault();

            const productId = addToCartBtn.dataset.id;
            if (!productId) {
                alert("❌ Không tìm thấy ID sản phẩm!");
                isAdding = false;
                return;
            }

            try {
                await CartAPI.addToCart(productId, 1);
                window.dispatchEvent(new Event("cartUpdated"));
                alert("✅ Đã thêm vào giỏ hàng!");
            } catch (error) {
                console.error("Lỗi khi thêm vào giỏ hàng:", error);
                alert("❌ Thêm vào giỏ hàng thất bại.");
            } finally {
                isAdding = false;
            }
        }
    });

});

