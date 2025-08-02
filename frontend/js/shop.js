import { ShopAPI } from "../APIs/shopAPI.js";
import { ProductAPI } from "../APIs/productAPI.js";
import { formatCurrency, formatTimeAgo } from "../APIs/utils/formatter.js";

document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const shopId = urlParams.get('id');

    const pageLoader = document.getElementById('page-loader');
    const mainContent = document.querySelector('main.main-content');

    // Show loader initially
    if (pageLoader) pageLoader.style.display = 'flex';
    if (mainContent) mainContent.style.visibility = 'hidden';

    if (!shopId) {
        displayShopNotFound();
        hideLoader();
        return;
    }

    try {
        // Fetch shop details and products
        const shopDataResponse = await ShopAPI.getShopWithProducts(shopId);

        if (shopDataResponse.success && shopDataResponse.data && shopDataResponse.data.shop) {
            const shop = shopDataResponse.data.shop;
            const products = shopDataResponse.data.products;

            renderShopDetails(shop, shop);
            renderShopProducts(products);
            attachEventListeners(shop);

        } else {
            displayShopNotFound(shopDataResponse.message || 'Không tìm thấy thông tin cửa hàng.');
        }
    } catch (error) {
        console.error('Error fetching shop data:', error);
        displayShopNotFound('Đã xảy ra lỗi khi tải dữ liệu cửa hàng.');
    } finally {
        hideLoader();
    }
});

function hideLoader() {
    const pageLoader = document.getElementById('page-loader');
    const mainContent = document.querySelector('main.main-content');
    if (pageLoader) {
        pageLoader.style.opacity = '0';
        setTimeout(() => pageLoader.style.display = 'none', 300);
    }
    if (mainContent) {
        mainContent.style.visibility = 'visible';
    }
}

function displayShopNotFound(message = 'Cửa hàng không tồn tại.') {
    const container = document.querySelector('main.main-content .container');
    if (container) {
        container.innerHTML = `
            <div class="shop-not-found" style="text-align: center; padding: 50px;">
                <h2>${message}</h2>
                <p>Xin lỗi, cửa hàng bạn tìm kiếm không có trong hệ thống. Vui lòng kiểm tra lại hoặc xem các cửa hàng khác.</p>
                <a href="./index.html" class="btn btn-primary" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Quay lại trang chủ</a>
            </div>
        `;
    }
}

function renderShopDetails(shop, shopRating) {
    document.title = `${shop.name} - T5 Market`;

    const shopAvatarElement = document.getElementById('shopAvatar');
    if (shopAvatarElement) {
        if (shop.logoUrl) {
            shopAvatarElement.innerHTML = `<img loading="lazy" src="${shop.logoUrl}" alt="Shop Avatar">`;
        } else {
            shopAvatarElement.textContent = shop.name ? shop.name.substring(0, 2).toUpperCase() : 'NA'; // Fallback to initials
        }
    }

    const shopNameElement = document.getElementById('shopName');
    if (shopNameElement) shopNameElement.textContent = shop.name;

    const shopAddressElement = document.getElementById('shopAddress');
    if (shopAddressElement) shopAddressElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${shop.address}`;

    const shopFullAddressElement = document.getElementById('shopFullAddress');
    if (shopFullAddressElement) shopFullAddressElement.textContent = shop.address || 'Địa chỉ chưa cập nhật';

    const shopJoinedDate = document.getElementById('shopJoinedDate');
    if (shopJoinedDate) shopJoinedDate.innerHTML = `</i> ${formatTimeAgo(shop.createdAt)}`;

    const shopDescription = document.getElementById('shopDescription');
    if (shopDescription) shopDescription.textContent = shop.description || 'Chưa có mô tả nào cho cửa hàng này.';

    const shopPoliciesList = document.getElementById('shopPoliciesList');
    const noPolicyMessage = document.getElementById('noPolicyMessage');
    if (shopPoliciesList) {
        shopPoliciesList.innerHTML = '';
        if (shop.policies && shop.policies.length > 0) {
            shop.policies.forEach(policy => {
                const policyItem = document.createElement('li');
                policyItem.className = 'policy-item';
                let iconClass = '';
                switch(policy.type) {
                    case 'shipping': iconClass = 'fas fa-truck'; break;
                    case 'warranty': iconClass = 'fas fa-shield-alt'; break;
                    case 'return': iconClass = 'fas fa-exchange-alt'; break;
                    case 'installment': iconClass = 'fas fa-money-check-alt'; break;
                    case 'tradein': iconClass = 'fas fa-sync-alt'; break;
                    default: iconClass = 'fas fa-file-alt'; // Default icon for custom policies
                }
                policyItem.innerHTML = `<i class="${iconClass} policy-icon"></i> ${policy.value}`;
                shopPoliciesList.appendChild(policyItem);
            });
            if (noPolicyMessage) noPolicyMessage.classList.add('hidden');
        } else {
            if (noPolicyMessage) noPolicyMessage.classList.remove('hidden');
        }
    }

    // Update shop rating
    const starsContainer = document.getElementById('shopStars');
    const ratingText = document.getElementById('shopRatingText');

    if (starsContainer && ratingText) {
        starsContainer.innerHTML = ''; // Clear current stars
        const averageRating = shopRating.averageRating || 0;
        const totalReviews = shopRating.totalReviews || 0;
        const roundedRating = Math.round(averageRating);

        for (let i = 1; i <= 5; i++) {
            const starIcon = document.createElement('i');
            starIcon.classList.add('fas', 'fa-star', 'star');
            if (i > roundedRating) {
                starIcon.style.color = '#e0e0e0';
            }
            starsContainer.appendChild(starIcon);
        }
        ratingText.textContent = `(${averageRating.toFixed(1)} - ${totalReviews} đánh giá)`;
    }

    // Update shop stats (product count, sold count)
    const shopProductsCountElement = document.getElementById('shopProductsCount');
    const shopSoldCountElement = document.getElementById('shopSoldCount');
    if (shopProductsCountElement) shopProductsCountElement.textContent = shop.product_count || 0;
    if (shopSoldCountElement) shopSoldCountElement.textContent = shop.sold_count || 0;

    // Handle phone number display toggle
    const shopPhoneDisplay = document.getElementById("shopPhoneDisplay");
    const phoneToggle = document.getElementById("phoneToggle");
    if (shop.phone && shopPhoneDisplay && phoneToggle) {
        const fullPhone = shop.phone;
        shopPhoneDisplay.textContent = fullPhone.substring(0, 5) + "***";
        phoneToggle.dataset.fullPhone = fullPhone; // Store full phone number
        phoneToggle.onclick = (e) => {
            e.preventDefault();
            if (shopPhoneDisplay.textContent.includes("***")) {
                shopPhoneDisplay.textContent = fullPhone;
                phoneToggle.textContent = "Ẩn số";
            } else {
                shopPhoneDisplay.textContent = fullPhone.substring(0, 5) + "***";
                phoneToggle.textContent = "Hiện số";
            }
        };
    } else if (shopPhoneDisplay) {
        shopPhoneDisplay.textContent = 'N/A';
        if (phoneToggle) phoneToggle.style.display = 'none'; // Hide toggle if no phone
    }

}

function attachEventListeners(shop) {
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
            handleTabSwitch(tabName, shop._id); // Pass shopId
        });
    });
    // Initial load
    handleTabSwitch('cuaHang', shop._id); // Default to 'Cửa hàng' tab
}

function handleTabSwitch(tabName, shopId) {
    console.log(`Switching to tab: ${tabName}`);
    const shopIntroCard = document.getElementById('shopIntroCard');
    const productsForSaleCard = document.getElementById('productsForSaleCard');
    const reviewContentCard = document.getElementById('reviewContentCard');
    
    // Get the new section containers
    const topSection = document.querySelector('.top-section');
    const bottomSection = document.querySelector('.bottom-section');

    // Hide all main content cards first
    if(shopIntroCard) shopIntroCard.classList.add('hidden');
    if(productsForSaleCard) productsForSaleCard.classList.add('hidden');
    if(reviewContentCard) reviewContentCard.classList.add('hidden');

    // Hide sections by default
    if (topSection) topSection.classList.add('hidden');
    if (bottomSection) bottomSection.classList.add('hidden');

    if (tabName === 'cuaHang') {
        if (topSection) topSection.classList.remove('hidden');
        if (bottomSection) bottomSection.classList.remove('hidden');
        if(shopIntroCard) shopIntroCard.classList.remove('hidden');
        if(productsForSaleCard) productsForSaleCard.classList.remove('hidden');
        // No need to call loadProductsForSaleContent here, it's part of initial render
    } else if (tabName === 'danhGia') {
        if (bottomSection) bottomSection.classList.remove('hidden');
        if(reviewContentCard) reviewContentCard.classList.remove('hidden');
        loadReviewsContent(shopId);
    }
}

async function loadReviewsContent(shopId) {
    console.log("Loading reviews content...");
    const reviewList = document.getElementById('reviewList');
    const overallRatingScore = document.getElementById('overallRatingScore');
    const overallRatingStars = document.getElementById('overallRatingStars');
    const overallTotalReviews = document.getElementById('overallTotalReviews');
    const allReviewsCount = document.getElementById('allReviewsCount');
    const buyerReviewsCount = document.getElementById('buyerReviewsCount');

    if (!reviewList || !overallRatingScore || !overallRatingStars || !overallTotalReviews || !allReviewsCount || !buyerReviewsCount) return;

    reviewList.innerHTML = '<p>Đang tải đánh giá...</p>';
    
    try {
        const response = await ShopAPI.getShopRating(shopId);
        if (response.success) {
            const { averageRating, totalReviews, reviews, reviewCriteria } = response.data;
            
            overallRatingScore.textContent = averageRating.toFixed(1);
            overallTotalReviews.textContent = `(${totalReviews} đánh giá)`;
            allReviewsCount.textContent = totalReviews;
            buyerReviewsCount.textContent = totalReviews; // Assuming all reviews are from buyers for now

            overallRatingStars.innerHTML = ''; // Clear current stars
            const roundedRating = Math.round(averageRating);
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                star.className = `fas fa-star ${i <= roundedRating ? 'filled' : ''}`; // Add filled class for styling
                overallRatingStars.appendChild(star);
            }
            renderReviewList(reviews);

        } else {
            reviewList.innerHTML = `<p>Lỗi khi tải đánh giá: ${response.error}</p>`;
        }
    } catch (error) {
        console.error("Error loading reviews:", error);
        reviewList.innerHTML = '<p>Đã xảy ra lỗi khi tải đánh giá.</p>';
    }
}

function renderReviewList(reviews) {
    const reviewList = document.getElementById('reviewList');
    reviewList.innerHTML = '';

    if (reviews.length === 0) {
        reviewList.innerHTML = '<p>Chưa có đánh giá nào.</p>';
        return;
    }

    reviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';

        const userAvatar = review.user.avatar || './assests/images/default-user.png';
        const productName = review.product ? review.product.name : 'Sản phẩm không tồn tại';
        const productPrice = review.product ? formatCurrency(review.product.price) : 'N/A';
        const productImage = review.product && review.product.images && review.product.images.length > 0 ? review.product.images[0] : './assests/images/default-product.png';

        let criteriaTagsHTML = '';
        if(review.criteria && review.criteria.length > 0) {
            criteriaTagsHTML = review.criteria.map(crit => `<span class="criteria-tag">${crit}</span>`).join('');
        }
        
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<i class="fas fa-star ${i <= review.rating ? 'filled' : ''}"></i>`;
        }

        reviewItem.innerHTML = `
            <div class="reviewer-avatar">
                <img  loading="lazy" src="${userAvatar}" alt="${review.user.fullName}">
            </div>
            <div class="review-content">
                <div class="reviewer-name">${review.user.fullName}</div>
                <div class="review-criteria-tags">
                    ${criteriaTagsHTML}
                </div>
                <div class="review-meta">
                    <div class="stars">${starsHTML}</div>
                    <span>|</span>
                    <span>${formatTimeAgo(review.createdAt)}</span>
                </div>
                <div class="review-product">
                    <div class="review-product-image">
                        <img loading="lazy" src="${productImage}" alt="${productName}">
                    </div>
                    <div class="review-product-details">
                        <div class="review-product-name">${productName}</div>
                        <div class="review-product-price">${productPrice}</div>
                    </div>
                </div>
            </div>
        `;
        reviewList.appendChild(reviewItem);
    });
}


function renderShopProducts(products) {
    const shopProductsGrid = document.getElementById('shopProductsGrid');
    const noProductsMessage = document.getElementById('noProductsMessage');

    if (!shopProductsGrid || !noProductsMessage) return;

    if (products && products.length > 0) {
        shopProductsGrid.innerHTML = products.map(product => `
            <a href="product.html?id=${product._id}" class="new-product-card">
                <div class="card-top">
                    <img loading="lazy" src="${product.images?.[0] || './assests/images/default-product.jpg'}" alt="${product.name}" />
                    <button class="like-btn" data-id="${product._id}" title="Thêm yêu thích">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    
                </div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <div class="price-wrapper">
                        <span class="current-price">${formatCurrency(product.price)}</span>
                    </div>
                    <div class="product-list-meta">
                        <i class="fa-solid fa-store"></i> ${formatTimeAgo(product.createdAt)}
                    </div>
                </div>
            </a>
        `).join('');
        noProductsMessage.classList.add('hidden');
    } else {
        shopProductsGrid.innerHTML = ''; // Clear any loading messages
        noProductsMessage.classList.remove('hidden');
    }
} 