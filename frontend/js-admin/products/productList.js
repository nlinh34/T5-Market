import { ProductAPI } from "../../APIs/productAPI.js";

export class ProductList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.loadProducts(); 
  }

  

  async loadProducts() {
    try {
      const result = await ProductAPI.getPendingProducts();
      if (result.success) {
        this.renderProducts(result.data);
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
                        ${products
                          .map((product) => this.renderProductRow(product))
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
    this.container.innerHTML = html;
    this.container.querySelectorAll(".approve-btn").forEach((button) => {
              button.onclick = async (e) => {
                const productId = e.target.closest("button").dataset.id;
                try {
                  const result = await ProductAPI.updateStatus(productId);
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
  }

  renderProductRow(product) {
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
                <td>${this.getCategoryName(product.category?.name)}</td>
                <td>${product.description}</td>
                <td>${product.seller?.fullName || "Không rõ"}</td>
                <td class="action-buttons">
                  <button class="approve-btn" data-id="${product._id}">
                    <i class="fas fa-check"></i> Duyệt
                  </button>
                  <button class="delete-btn" data-id="${product._id}">
                    <i class="fas fa-trash"></i> Xóa
                  </button>
                </td>
                </td>
            </tr>
        `;
  }

  

  getCategoryName(category) {
    const categories = {
      "main course": "Món chính",
      "side dish": "Món phụ",
      drink: "Đồ uống",
      dessert: "Tráng miệng",
    };
    return categories[category] || category;
  }

  async handleDelete(productId) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
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
  }
}
