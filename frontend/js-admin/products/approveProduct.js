import { ProductAPI } from "../../APIs/productAPI.js";
import { showNotification } from "../../APIs/utils/notification.js";

export class ApproveProduct {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            this.renderLoading();
            const result = await ProductAPI.getPendingProducts();

            if (result.data && Array.isArray(result.data)) {
                this.products = result.data;
                if (result.data.length === 0) {
                    this.renderEmptyState("Không có sản phẩm nào chờ duyệt.");
                } else {
                    this.renderProducts(result.data);
                }
            } else {
                throw new Error(result.message || "Không thể tải danh sách sản phẩm");
            }
        } catch (error) {
            console.error("Load products error:", error);
            this.renderError("Có lỗi xảy ra khi tải danh sách sản phẩm chờ duyệt!");
        }
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Đang tải danh sách sản phẩm...</p>
            </div>
        `;
    }

    renderError(message) {
        this.container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button id="retryBtn" class="retry-btn">Thử lại</button>
            </div>
        `;
        document.getElementById("retryBtn").addEventListener("click", () => {
            this.loadProducts();
        });
    }

    renderEmptyState(message) {
        this.container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>${message}</p>
            </div>
        `;
    }

    renderProducts(products) {
        const html = `
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Mô tả</th>
              <th>Người bán</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${products.map((product) => this.renderProductRow(product)).join("")}
          </tbody>
        </table>
      </div>
    `;
        this.container.innerHTML = html;

        this.container.querySelectorAll(".approve-btn").forEach((button) => {
            button.onclick = async (e) => {
                const productId = e.target.closest("button").dataset.id;
                try {
                    const result = await ProductAPI.approveProduct(productId);
                    console.log("Kết quả API:", result);
                    if (result && !result.error && result.message !== "Sản phẩm không tồn tại hoặc đã xử lý") {
                        showNotification("Sản phẩm đã được duyệt!", "success", "fas fa-check-circle");
                        this.products = this.products.filter(p => p._id === productId ? false : true);
                        this.renderProducts(this.products);
                    } else {
                        showNotification(result.message || "Không thể duyệt sản phẩm!", "error", "fas fa-times-circle");
                    }

                } catch (error) {
                    console.error("Approve error:", error);
                    showNotification("Có lỗi khi duyệt sản phẩm", "error", "fas fa-times-circle");
                }
            };
        });

        this.container.querySelectorAll(".delete-btn").forEach((button) => {
            button.onclick = (e) => {
                const productId = e.target.closest("button").dataset.id;
                this.showDeleteConfirmation(productId);
            };
        });
    }

    renderProductRow(product) {
        const categoryName = product.category?.name || "Không rõ";
        const shopName = product.shop?.name || "Không rõ";
        return `
      <tr>
        <td class="product-image">
          <img loading="lazy" src="${product.image_url}" alt="${product.name}">
        </td>
        <td class="ellipsis">${product.name}</td>
        <td>${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(product.price)}</td>
        <td>${categoryName}</td>
        <td>${product.description}</td>
        <td>${shopName}</td>
        <td>
          <div class="action-buttons">
            <button class="approve-btn" data-id="${product._id}">
              <i class="fas fa-check"></i> Duyệt
            </button>
            <button class="delete-btn" data-id="${product._id}">
              <i class="fas fa-trash"></i> Xóa
            </button>
          </div>
        </td>
      </tr>
    `;
    }

    async handleDelete(productId) {
        try {
            const result = await ProductAPI.deleteProduct(productId);
            if (result.success) {
                showNotification("Xóa sản phẩm thành công!", "success", "fas fa-trash-alt");
                this.loadProducts();
            } else {
                showNotification(result.message || "Có lỗi xảy ra!", "error", "fas fa-times-circle");
            }
        } catch (error) {
            console.error("Delete error:", error);
            showNotification("Có lỗi xảy ra khi xóa sản phẩm!", "error", "fas fa-times-circle");
        }
    }

    showDeleteConfirmation(productId) {
        const deleteModal = document.getElementById('deleteProductModal');
        const confirmDeleteBtn = document.getElementById('confirmDeleteProductBtn');

        deleteModal.classList.add('active');

        // Remove any previous event listeners to prevent multiple calls
        confirmDeleteBtn.onclick = null;

        confirmDeleteBtn.onclick = async () => {
            deleteModal.classList.remove('active');
            await this.handleDelete(productId);
        };
    }
}
