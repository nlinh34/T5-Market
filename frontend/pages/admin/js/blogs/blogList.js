// frontend/pages/admin/js/blogs/blogList.js
import { BlogAPI } from "../../../../APIs/blogAPI.js";
import { BlogForm } from "./blogForm.js";

export class BlogList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.blogForm = new BlogForm();
    this.initialize();
  }

  initialize() {
    this.loadBlogs();
    document.getElementById("addBlogBtn").onclick = () => {
      this.blogForm.openModal(null, () => this.loadBlogs());
    };
  }

  async loadBlogs() {
    try {
      const result = await BlogAPI.getAllBlogs();
      if (result.success) {
        this.renderBlogs(result.data);
      } else {
        throw new Error(result.message || "Không thể tải danh sách bài viết");
      }
    } catch (error) {
      console.error("Load blogs error:", error);
      this.container.innerHTML =
        '<p class="error">Có lỗi xảy ra khi tải danh sách bài viết</p>';
    }
  }

  renderBlogs(blogs) {
    const html = `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Hình ảnh</th>
                            <th>Nội dung</th>
                            <th>Tác giả</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${blogs
                          .map((blog) => this.renderBlogRow(blog))
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
    this.container.innerHTML = html;

    this.container.querySelectorAll(".edit-btn").forEach((button) => {
      button.onclick = (e) => {
        const blogData = JSON.parse(e.target.dataset.blog);
        this.blogForm.openModal(blogData, () => this.loadBlogs());
      };
    });

    this.container.querySelectorAll(".delete-btn").forEach((button) => {
      button.onclick = (e) => this.handleDelete(e.target.dataset.id);
    });
  }

  renderBlogRow(blog) {
    return `
            <tr>
                <td>${blog.name}</td>
                <td class="blog-image">
                    <img src="${blog.imageUrl}" alt="${blog.name}" 
                         onerror="this.src='../../../assets/images/default-blog.png'">
                </td>
                <td class="blog-content">${this.truncateContent(
                  blog.content
                )}</td>
                <td>
                    <div class="author-info">
                        <span class="author-name">${
                          blog.createdBy?.fullName || "N/A"
                        }</span>
                    </div>
                </td>
                <td>${new Date(blog.createdAt).toLocaleDateString("vi-VN")}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-blog='${JSON.stringify(
                      blog
                    )}'>
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="delete-btn" data-id="${blog._id}">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
  }

  truncateContent(content, maxLength = 100) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  }

  async handleDelete(blogId) {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        const result = await BlogAPI.deleteBlog(blogId);
        if (result.success) {
          alert("Xóa bài viết thành công!");
          this.loadBlogs();
        } else {
          alert(result.message || "Có lỗi xảy ra!");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Có lỗi xảy ra khi xóa bài viết!");
      }
    }
  }
}
