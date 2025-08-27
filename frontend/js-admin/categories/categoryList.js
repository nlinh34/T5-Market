import { CategoryAPI } from "../../APIs/categoryAPI.js";
import { CategoryForm } from "./caterogyForm.js";

export class CategoryList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.categoryForm = new CategoryForm();
    this.initialize();
  }

  initialize() {
    this.loadCategories();
    // Xử lý nút thêm danh mục mới
    document.getElementById("addCategoryBtn").onclick = () => {
      this.categoryForm.openModal(null, () => this.loadCategories());
    };
  }

  async loadCategories() {
    try {
      const result = await CategoryAPI.getAllCategories();
      if (result.success) {
        this.renderCategories(result.data);
      } else {
        throw new Error(result.message || "Không thể tải danh sách danh mục");
      }
    } catch (error) {
      console.error("Load categories error:", error);
      this.container.innerHTML =
        '<p class="error">Có lỗi xảy ra khi tải danh sách danh mục</p>';
    }
  }

  renderCategories(categories) {
    const html = `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Hình ảnh</th>
                             <th>Số Lượng</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories
        .map((category) => this.renderCategoryRow(category))
        .join("")}
                    </tbody>
                </table>
            </div>
        `;
    this.container.innerHTML = html;

    // Thêm event listeners cho các nút
    this.container.querySelectorAll(".edit-btn").forEach((button) => {
      button.onclick = (e) => {
        const btn = e.target.closest("button"); // Lấy đúng button
        if (!btn) return;

        const categoryDataStr = btn.dataset.category;
        if (!categoryDataStr) return;

        const categoryData = JSON.parse(categoryDataStr);
        this.categoryForm.openModal(categoryData, () => this.loadCategories());
      };
    });

    this.container.querySelectorAll(".delete-btn").forEach((button) => {
      button.onclick = (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const categoryId = btn.dataset.id;
        if (!categoryId) return;

        this.showDeleteConfirmation(categoryId);
      };
    });

  }

  renderCategoryRow(category) {
    return `
            <tr>
                <td class="ellipsis">${category.name}</td>
                <td class="product-image">
                    <img loading="lazy" src="${category.imageURL}" alt="${category.name}" 
                         onerror="this.src='../../../assets/images/default-product.png'">
                </td>
                <td>15</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" data-category='${JSON.stringify(
      category
    )}'>
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="delete-btn" data-id="${category._id}">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
  }

  async handleDelete(categoryId) {
    try {
      const result = await CategoryAPI.deleteCategory(categoryId);
      if (result.success) {
        alert("Xóa danh mục thành công!");
        this.loadCategories();
      } else {
        alert(result.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Có lỗi xảy ra khi xóa danh mục!");
    }
  }

  showDeleteConfirmation(categoryId) {
    const deleteModal = document.getElementById('deleteCategoryModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteCategoryBtn');

    deleteModal.classList.add('active');

    // Remove any previous event listeners to prevent multiple calls
    confirmDeleteBtn.onclick = null;

    confirmDeleteBtn.onclick = async () => {
      deleteModal.classList.remove('active');
      await this.handleDelete(categoryId);
    };
  }
}
