import { CategoryAPI } from "../../APIs/categoryAPI.js";

export class CategoryForm {
  constructor() {
    this.modal = document.getElementById("categoryModal");
    this.form = document.getElementById("categoryForm");
    this.initialize();
  }

  initialize() {
    // Xử lý đóng modal
    const closeBtn = this.modal.querySelector(".close");
    const cancelBtn = this.modal.querySelector(".btn-cancel");

    closeBtn.onclick = () => this.closeModal();
    cancelBtn.onclick = () => this.closeModal();

    // Xử lý submit form
    this.form.onsubmit = (e) => this.handleSubmit(e);
  }

  openModal(categoryData = null, onSuccess = null) {
    this.onSuccess = onSuccess;
    this.form.reset();

    if (categoryData) {
      document.getElementById("categoryId").value = categoryData._id;
      document.getElementById("categoryName").value = categoryData.name;
      document.getElementById("categoryImageURL").value = categoryData.imageURL;
      document.getElementById("modalTitle").textContent = "Cập Nhật Danh Mục";
    } else {
      document.getElementById("categoryId").value = "";
      document.getElementById("modalTitle").textContent = "Thêm Danh Mục Mới";
    }

    this.modal.style.display = "block";
  }

  closeModal() {
    this.modal.style.display = "none";
    this.form.reset();
  }

  async handleSubmit(e) {
    e.preventDefault();

    const categoryData = {
      name: document.getElementById("categoryName").value.trim(),
      imageURL: document.getElementById("categoryImageURL").value.trim(),
    };

    const categoryId = document.getElementById("categoryId").value;

    try {
      let result;
      if (categoryId) {
        result = await CategoryAPI.updateCategory(categoryId, categoryData);
      } else {
        result = await CategoryAPI.createCategory(categoryData);
      }

      if (result.success) {
        this.closeModal();
        if (this.onSuccess) this.onSuccess();
      } else {
        alert(result.message || "Đã xảy ra lỗi khi lưu danh mục.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Có lỗi xảy ra khi gửi dữ liệu!");
    }
  }

  async deleteCategory(categoryId) {
  const confirmDelete = confirm("Bạn có chắc muốn xóa danh mục này?");
  if (!confirmDelete) return;

  try {
    const result = await CategoryAPI.deleteCategory(categoryId);
    if (result.success) {
      alert("Xóa danh mục thành công!");
      if (this.onSuccess) this.onSuccess();
    } else {
      alert(result.message || "Xóa danh mục thất bại!");
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Có lỗi xảy ra khi xóa danh mục!");
  }
}

}
