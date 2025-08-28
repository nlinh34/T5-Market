import { ProductAPI } from "../../APIs/productAPI.js";

const statusDisplayVN = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export class ProductList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const result = await ProductAPI.getAllProducts();
      console.log("Kết quả từ API:", result);

      if (result.data && Array.isArray(result.data)) {
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
              <th>Trạng thái</th>
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
          if (result.success) {
            alert("Sản phẩm đã được duyệt!");
            this.loadProducts(); // Refresh danh sách
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
          <img loading="lazy" 
              src="${product.images && product.images.length > 0 
                  ? product.images[0] 
                  : '/assets/images/no-image.png'}" 
              alt="${product.name}">       
        </td>
        <td class="ellipsis">${product.name}</td>
        <td>${new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(product.price)}</td>
        <td>${categoryName}</td>
        <td>${statusDisplayVN[product.status] || "Chưa cập nhật"}</td>
        <td>${shopName}</td>
        <td>
          <div class="action-buttons">
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
        alert("Xóa sản phẩm thành công!");
        this.loadProducts();
      } else {
        alert(result.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Có lỗi xảy ra khi xóa sản phẩm!");
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
