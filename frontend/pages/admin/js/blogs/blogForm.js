// frontend/pages/admin/js/blogs/blogForm.js
import { BlogAPI } from "../../../../APIs/blogAPI.js";

export class BlogForm {
  constructor() {
    this.modal = document.getElementById("blogModal");
    this.form = document.getElementById("blogForm");
    this.initialize();
  }

  initialize() {
    const closeBtn = this.modal.querySelector(".close");
    const cancelBtn = this.modal.querySelector(".btn-cancel");

    closeBtn.onclick = () => this.closeModal();
    cancelBtn.onclick = () => this.closeModal();

    this.form.onsubmit = (e) => this.handleSubmit(e);
  }

  openModal(blogData = null, onSuccess = null) {
    this.onSuccess = onSuccess;
    this.form.reset();

    if (blogData) {
      document.getElementById("blogId").value = blogData._id;
      document.getElementById("blogTitle").value = blogData.name;
      document.getElementById("blogContent").value = blogData.content;
      document.getElementById("blogImage").value = blogData.imageUrl;
      document.getElementById("modalTitle").textContent = "Cập Nhật Bài Viết";
    } else {
      document.getElementById("blogId").value = "";
      document.getElementById("modalTitle").textContent = "Thêm Bài Viết Mới";
    }
    this.modal.style.display = "block";
  }

  closeModal() {
    this.modal.style.display = "none";
    this.form.reset();
  }

  async handleSubmit(e) {
    e.preventDefault();

    const blogData = {
      name: document.getElementById("blogTitle").value,
      content: document.getElementById("blogContent").value,
      imageUrl: document.getElementById("blogImage").value,
    };

    const blogId = document.getElementById("blogId").value;

    try {
      let result;
      if (blogId) {
        result = await BlogAPI.updateBlog(blogId, blogData);
      } else {
        result = await BlogAPI.createBlog(blogData);
      }

      if (result.success) {
        this.closeModal();
        if (this.onSuccess) {
          this.onSuccess();
        }
      } else {
        alert(result.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Có lỗi xảy ra khi lưu bài viết!");
    }
  }
}
