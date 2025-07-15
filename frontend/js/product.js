document.addEventListener('DOMContentLoaded', async function() {
    // Function to get product ID from URL
    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || window.location.pathname.split('/').pop();
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

    // Function to update UI with product data
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
            <span class="location"><i class="fas fa-map-marker-alt"></i> Hà Nội</span>
        `;
        productMeta[2].innerHTML = `
            <span class="time"><i class="fas fa-clock"></i> Đăng ${daysAgo(data.createdAt)} ngày trước</span>
        `;

        // Update seller info
        const sellerInfo = document.querySelector('.seller-info');
        sellerInfo.querySelector('.seller-name').textContent = data.shop.name;
        sellerInfo.querySelector('.seller-status').textContent = 'Đã xác thực';
        sellerInfo.querySelector('.seller-meta').innerHTML = `
            <span><i class="fas fa-box-open"></i> 12 sản phẩm</span>
            <span><i class="fas fa-star"></i> 4.8 (56 đánh giá)</span>
            <span><i class="fas fa-clock"></i> Tham gia 1 năm trước</span>
        `;
        sellerInfo.querySelector('.seller-avatar img').src = '../images/avatar/default-avatar.jpg';
        sellerInfo.querySelector('.seller-actions').innerHTML = `
            <button class="btn btn-primary" style="background: green">Xem cửa hàng</button>
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

    // Fetch and populate product data
    const productId = getProductIdFromUrl();
    if (productId) {
        const productData = await fetchProductData(productId);
        updateProductUI(productData);
    } else {
        displayNotFoundCard();
    }
});