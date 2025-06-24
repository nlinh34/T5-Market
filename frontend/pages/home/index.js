// frontend/pages/home/index.js
import { CategoryAPI } from "../../APIs/categoryAPI.js";

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, starting to load categories...");

    async function addToCart(productId) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:5000/cart/add", {
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
        if (!imageURL || typeof imageURL !== "string" || imageURL.trim() === "" || imageURL === "null" || imageURL === "undefined") {
            return "../../assests/images/phukien.png";
        }
        return imageURL;
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
                <img src="${category.imageURL}" alt="${category.name}" class="category-img" onerror="this.onerror=null;this.src='../../assests/images/phukien.png';"/>
                <h3 class="category-name">${category.name}</h3>
            </div>
        `).join("");

        categoryGrid.innerHTML = categoriesHTML;
    }

    async function loadApprovedProducts() {
        try {
            const grid = document.querySelector(".products-grid");
            grid.innerHTML = '<div class="loading">Đang tải sản phẩm...</div>';

            const response = await fetch("http://127.0.0.1:5000/products/approved");
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
                uniqueProducts.push({...product, image_url: img });
                seenImages.add(img);
            }
        }

        const html = uniqueProducts.map(product => `
            <div class="product-card">
                <img src="${product.image_url}" alt="${product.name}" class="product-img" onerror="this.onerror=null;this.src='../../assests/images/phukien.png';" />
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString()} VND</p>
                <p class="product-desc">${product.description}</p>
                <div class="product-actions">
                    <button class="view-btn" data-id="${product._id}">Xem chi tiết</button>
                    <button class="add-cart-btn" data-id="${product._id}"><i class="fa fa-cart-plus"></i></button>
                </div>
            </div>
        `).join("");

        grid.innerHTML = html;

        document.querySelectorAll(".add-cart-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.id || e.target.closest('.add-cart-btn').dataset.id;
                addToCart(id);
            });
        });

        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.id || e.target.closest('.view-btn').dataset.id;
                window.location.href = `/pages/detail-product/product.html?id=${id}`;
            });
        });
    }

    async function loadFeaturedProducts() {
        try {
            const featuredGrid = document.querySelector(".featured-grid");
            featuredGrid.innerHTML = '<div class="loading">Đang tải sản phẩm nổi bật...</div>';

            const response = await fetch("http://127.0.0.1:5000/products/featured");
            if (!response.ok) throw new Error("Lỗi khi tải sản phẩm nổi bật");

            const result = await response.json();

            if (result.success) {
                renderFeaturedProducts(result.data);
            } else {
                const fallbackResponse = await fetch("http://127.0.0.1:5000/products/approved");
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
                uniqueProducts.push({...product, image_url: img });
                seenImages.add(img);
            }
        }

        const html = uniqueProducts.map(product => `
            <div class="featured-product-card">
                <div class="featured-badge">
                    <i class="fas fa-star"></i> Nổi bật
                </div>
                <img src="${product.image_url}" alt="${product.name}" class="featured-product-img" onerror="this.onerror=null;this.src='../../assests/images/phukien.png';" />
                <div class="featured-product-info">
                    <h3 class="featured-product-name">${product.name}</h3>
                    <p class="featured-product-price">${product.price.toLocaleString()} VND</p>
                    <p class="featured-product-desc">${product.description}</p>
                    <div class="featured-product-actions">
                        <button class="featured-view-btn" data-id="${product._id}">Xem chi tiết</button>
                        <button class="featured-add-cart-btn" data-id="${product._id}"><i class="fa fa-cart-plus"></i></button>
                    </div>
                </div>
            </div>
        `).join("");

        featuredGrid.innerHTML = html;
        attachFeaturedProductEvents();
    }

    function attachFeaturedProductEvents() {
        document.querySelectorAll(".featured-view-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.id || e.target.closest('.featured-view-btn').dataset.id;
                window.location.href = `/pages/detail-product/product.html?id=${id}`;
            });
        });

        document.querySelectorAll(".featured-add-cart-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.id || e.target.closest('.featured-add-cart-btn').dataset.id;
                addToCart(id);
            });
        });
    }

    loadCategories();
    loadApprovedProducts();
    loadFeaturedProducts();
});
