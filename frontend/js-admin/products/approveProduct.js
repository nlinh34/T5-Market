import { ProductAPI } from "../../APIs/productAPI.js";

export class ApproveProduct {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const result = await ProductAPI.getPendingProducts();


            if (result.data && Array.isArray(result.data)) {
                this.products = result.data;
                if (result.data.length === 0) {
                    this.container.innerHTML =
                        '<p class="no-products">Không có sản phẩm nào.</p>';
                } else {
                    this.renderProducts(result.data);
                }
            } else {
                throw new Error(result.message || "Không thể tải danh sách sản phẩm");
            }
        } catch (error) {
            console.error("Load products error:", error);
            this.container.innerHTML =
                '<p class="error">Có lỗi xảy ra khi tải danh sách sản phẩm</p>';
        }
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
                        alert("Sản phẩm đã được duyệt!");
                        this.products = this.products.filter(p => p._id === productId ? false : true);
                        this.renderProducts(this.products);
                    } else {
                        alert(result.message || "Không thể duyệt sản phẩm!");
                    }

                } catch (error) {
                    console.error("Approve error:", error);
                    alert("Có lỗi khi duyệt sản phẩm");
                }
            };
        });

        this.container.querySelectorAll(".delete-btn").forEach((button) => {
            button.onclick = (e) => {
                const productId = e.target.closest("button").dataset.id;
                this.handleDelete(productId);
            };
        });
    }

    renderProductRow(product) {
        const categoryName = product.category?.name || "Không rõ";
        const shopName = product.shop?.name || "Không rõ";
        return `
      <tr>
        <td class="product-image">
          <img src="${product.image_url}" alt="${product.name}">
        </td>
        <td>${product.name}</td>
        <td>${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(product.price)}</td>
        <td>${categoryName}</td>
        <td>${product.description}</td>
        <td>${shopName}</td>
        <td class="action-buttons">
          <button class="approve-btn" data-id="${product._id}">
            <i class="fas fa-check"></i> Duyệt
          </button>
          <button class="delete-btn" data-id="${product._id}">
            <i class="fas fa-trash"></i> Xóa
          </button>
        </td>
      </tr>
    `;
    }

    async handleDelete(productId) {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            try {
                const result = await ProductAPI.deleteProduct(productId);
                if (result.success) {
                    alert("Xóa sản phẩm thành công!");
                    this.products = this.products.filter(p => p._id !== productId);
                    this.renderProducts(this.products);
                } else {
                    alert(result.message || "Có lỗi xảy ra!");
                }
            } catch (error) {
                console.error("Delete error:", error);
                alert("Có lỗi xảy ra khi xóa sản phẩm!");
            }
        }
    }
}
