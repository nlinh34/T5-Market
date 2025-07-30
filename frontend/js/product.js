import { ReviewAPI } from "../APIs/reviewAPI.js";
import { ProductAPI } from "../APIs/productAPI.js";

document.addEventListener('DOMContentLoaded', async function() {
    // Function to get product ID from URL
    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        return /^[0-9a-fA-F]{24}$/.test(id) ? id : null; // validate ObjectId luôn
    }

    // Function to fetch product data
    async function fetchProductData(productId) {
        try {
            const response = await fetch(`http://localhost:5000/products/${productId}`);
            if (!response.ok) throw new Error('Failed to fetch product data');
            const result = await response.json();
            if (!result.success) throw new Error('API returned unsuccessful response');
            return result.data;
        } catch (error) {
            console.error('Error fetching product data:', error);
            return null;
        }
    }

    // Function to format price in VND
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
    }

    // Function to calculate days ago
    function daysAgo(dateString) {
        const createdDate = new Date(dateString);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Function to display "Product Not Found" card
    function displayNotFoundCard() {
        const productSection = document.querySelector('.product-detail .container');
        productSection.innerHTML = `
            <div class="product-not-found" style="text-align: center; padding: 50px;">
                <h2>Sản phẩm không tồn tại</h2>
                <p>Xin lỗi, sản phẩm bạn tìm kiếm không có trong hệ thống. Vui lòng kiểm tra lại hoặc xem các sản phẩm khác.</p>
                <a href="../home/index.html" class="btn btn-primary" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Quay lại trang chủ</a>
            </div>
        `;
    }

    function updateProductUI(data) {
        if (!data) {
            displayNotFoundCard();
            return;
        }

        // Update page title
        document.title = `${data.name} - T5 Market`;

        // Update product image
        const mainImage = document.getElementById('mainImage');
        mainImage.src = data.images[0] || './assests/images/default-product.jpg';
        mainImage.alt = data.name;

        // Update breadcrumb
        const breadcrumb = document.querySelector('.breadcrumb');
        breadcrumb.innerHTML = `
            <a href="#">${data.category.name}</a> > <a href="#">${data.category.name}</a> > <a href="#">${data.name}</a>
        `;

        // Update product name
        document.querySelector('h1').textContent = data.name;

        // Update product meta (price, stock, location, time)
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
            <span class="time"><i class="fas fa-clock"></i> Đăng ${daysAgo(data.createdAt)} ngày trước</span>
        `;

        // Update seller info
        const sellerInfo = document.querySelector('.seller-info');
        const joinDate = data.shop.createdAt || data.shop.joinDate;
        const daysJoined = joinDate ? daysAgo(joinDate) : 'N/A';
        sellerInfo.querySelector('.seller-name').textContent = data.shop.name;
        sellerInfo.querySelector('.seller-status').textContent = data.shop.status;
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
        const descriptionTab = document.querySelector('#description');
        descriptionTab.innerHTML = `
            <h3>${data.name}</h3>
            <p>${data.description}</p>
        `;
    }

    // Existing UI interaction code
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            mainImage.src = this.getAttribute('data-image');
        });
    });

    // Quantity selector
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const quantityInput = document.querySelector('.quantity-input');

    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        plusBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }

    // Tab switching
    const tabHeaders = document.querySelectorAll('.tabs-header li');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabHeaders.forEach((header, index) => {
        header.addEventListener('click', function() {
            tabHeaders.forEach(h => h.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            tabPanes[index].classList.add('active');
        });
    });

    // Star rating in review form
    const stars = document.querySelectorAll('.rating-input i');

    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('fas', 'active');
                    s.classList.remove('far');
                } else {
                    s.classList.add('far');
                    s.classList.remove('fas', 'active');
                }
            });
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Quantity controls
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const removeBtns = document.querySelectorAll('.remove-btn');

    quantityBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.target.parentElement.querySelector('.quantity-input');
            let value = parseInt(input.value);

            if (e.target.textContent === '+' || e.target.classList.contains('fa-plus')) {
                input.value = value + 1;
            } else if (e.target.textContent === '-' || e.target.classList.contains('fa-minus')) {
                if (value > 1) {
                    input.value = value - 1;
                }
            }
            updateCartTotal();
        });
    });

    quantityInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.value < 1) input.value = 1;
            updateCartTotal();
        });
    });

    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('tr').remove();
            updateCartTotal();
        });
    });

    function updateCartTotal() {
        console.log('Cart updated');
    }

    //Lấy sp từ shop
    const productId = getProductIdFromUrl();
    if (productId) {
        const productData = await fetchProductData(productId);
        updateProductUI(productData);

        if (productData && productData.shop && productData.shop._id) {
            loadOtherProductsFromShop(productData.shop._id, productData._id);
        }

        if (productData && productData.category && productData.category._id) {
            loadSimilarProducts(productData.category._id, productData._id);
        }

        const detailSection = document.getElementById("productDetail");
        const loadingIndicator = document.getElementById("loadingIndicator");

        if (productData) {
            // Nếu có dữ liệu -> ẩn loading, hiện chi tiết
            if (detailSection) detailSection.style.display = "block";
            if (loadingIndicator) loadingIndicator.style.display = "none";
        } else {
            // Nếu không có dữ liệu -> giữ nguyên hoặc show thông báo
            if (loadingIndicator) loadingIndicator.innerHTML = `<p>Không tìm thấy sản phẩm.</p>`;
        }
    } else {
        displayNotFoundCard();
    }

    const reviewListEl = document.getElementById("review-list");
    const reviewsSummaryEl = document.getElementById("reviews-summary");

    // Hàm tạo star icons theo rating (1-5)
    function renderStars(rating) {
        let starsHTML = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHTML += `<i class="fas fa-star"></i>`;
            } else {
                starsHTML += `<i class="far fa-star"></i>`;
            }
        }
        return starsHTML;
    }

    // Hàm hiển thị danh sách review
    function renderReviews(reviews) {
        reviewListEl.innerHTML = ""; // Xoá cũ

        if (reviews.length === 0) {
            reviewListEl.innerHTML = `<p>Chưa có đánh giá nào cho sản phẩm này.</p>`;
            return;
        }

        reviews.forEach((review) => {
            const date = new Date(review.createdAt).toLocaleDateString("vi-VN");
            const userName = review.user ? .fullName || "Người dùng";
            const ratingStars = renderStars(review.rating);
            const comment = review.comment || "";

            const reviewItem = document.createElement("div");
            reviewItem.classList.add("review-item");

            reviewItem.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            <img src="/images/avatar/default-avatar.png" alt="${userName}">
                        </div>
                        <div class="reviewer-meta">
                            <span class="review-author">${userName}</span>
                            <span class="review-date">${date}</span>
                        </div>
                    </div>
                    <div class="review-rating">${ratingStars}</div>
                </div>
                <div class="review-body">
                    <p>${comment}</p>
                </div>
            `;

            reviewListEl.appendChild(reviewItem);
        });
    }

    // Fetch reviews and show summary
    async function loadReviews(productId) {
        const res = await ReviewAPI.getReviewsByProduct(productId);
        if (!res.success) {
            reviewsSummaryEl.innerHTML = "Không có đánh giá";
            return;
        }

        const reviews = res.data || [];
        const totalReviews = reviews.length;
        const avgRating = totalReviews ?
            reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews :
            0;

        reviewsSummaryEl.innerHTML = `
            <span class="avg-rating">${avgRating.toFixed(1)}</span>
            <span class="total-reviews">(${totalReviews} đánh giá)</span>
        `;

        renderReviews(reviews);
    }

    if (productId) {
        loadReviews(productId);
    } else {
        displayNotFoundCard();
    }

    // Hàm mới: Load sản phẩm khác từ shop
    async function loadOtherProductsFromShop(shopId, currentProductId) {
        const grid = document.querySelector(".products-grid");
        if (!grid) return;

        grid.innerHTML = "<p>Đang tải các sản phẩm khác...</p>";

        try {
            const res = await ProductAPI.getApprovedProductsByShopId(shopId);
            if (!res.success || !Array.isArray(res.data)) {
                grid.innerHTML = "<p>Không có sản phẩm nào để hiển thị.</p>";
                return;
            }

            // Lọc bỏ sản phẩm hiện tại
            const otherProducts = res.data.filter(p => p._id !== currentProductId);
            if (otherProducts.length === 0) {
                grid.innerHTML = "<p>Người bán không có sản phẩm nào khác.</p>";
                return;
            }

            // Hiển thị sản phẩm khác
            grid.innerHTML = otherProducts.map(product => `
                <div class="new-product-card">
                    <div class="card-top">
                        <img src="${product.images?.[0] || './assets/images/default-product.jpg'}" alt="${product.name}" />
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
                    <div class="product-info">
                        <h4 class="product-name">${product.name}</h4>
                        <div class="price-wrapper">
                            <span class="current-price">$${product.price.toFixed(2)}</span>
                        </div>
                        <div class="rating">
                            ${"★".repeat(product.rating || 4)}${"☆".repeat(5 - (product.rating || 4))}
                            <span>${(product.rating || 4.33).toFixed(2)}</span>
                        </div>
                        <div class="store">Cửa hàng: <strong>${product.shop?.name || 'Unknown'}</strong></div>
                    </div>
                </div>
            `).join("");

        } catch (error) {
            console.error("Lỗi khi tải sản phẩm khác từ shop:", error);
            grid.innerHTML = "<p>Không thể tải sản phẩm từ người bán.</p>";
        }
    }
    // Hàm mới: Load sản phẩm tương tự theo danh mục
    async function loadSimilarProducts(categoryId, currentProductId) {
        const container = document.querySelector(".similar-products-grid");
        if (!container) return;

        container.innerHTML = "<p>Đang tải sản phẩm tương tự...</p>";

        try {
            const res = await ProductAPI.getProductsByCategory(categoryId); // 💡 Bạn cần có API này
            if (!res.success || !Array.isArray(res.data)) {
                container.innerHTML = "<p>Không có sản phẩm tương tự để hiển thị.</p>";
                return;
            }

            const similarProducts = res.data.filter(p => p._id !== currentProductId);
            if (similarProducts.length === 0) {
                container.innerHTML = "<p>Không tìm thấy sản phẩm tương tự.</p>";
                return;
            }

            container.innerHTML = similarProducts.map(product => `
            <div class="new-product-card">
                <div class="card-top">
                    <img src="${product.images?.[0] || './assets/images/default-product.jpg'}" alt="${product.name}" />
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
        `).join("");

        } catch (error) {
            console.error("Lỗi khi tải sản phẩm tương tự:", error);
            container.innerHTML = "<p>Không thể tải sản phẩm tương tự.</p>";
        }
    }

});

