import { CategoryAPI } from "../../APIs/categoryAPI.js";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dipcjvi8x/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "t5market_assets";

// Hàm upload ảnh lên Cloudinary
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (!response.ok || !data.secure_url) throw new Error("Upload ảnh thất bại");
  return data.secure_url;
}

export class CategoryForm {
  constructor() {
    this.modal = document.getElementById("categoryModal");
    this.form = document.getElementById("categoryForm");
    this.imageInput = document.getElementById("categoryImage");
    this.previewContainer = document.getElementById("categoryImagePreview");
    this.initialize();
  }

  initialize() {
    const closeBtn = this.modal.querySelector(".close");
    const cancelBtn = this.modal.querySelector(".btn-cancel");
    closeBtn.onclick = () => this.closeModal();
    cancelBtn.onclick = () => this.closeModal();

    this.imageInput.addEventListener("change", () => this.previewImage());
    this.form.onsubmit = (e) => this.handleSubmit(e);
  }

previewImage() {
  // Xóa hết ảnh cũ trước khi preview
  this.previewContainer.innerHTML = "";

  const file = this.imageInput.files[0];
  if (!file) return;

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file); // nhanh hơn FileReader
  img.style.maxWidth = "150px";
  this.previewContainer.appendChild(img);
}

  openModal(categoryData = null, onSuccess = null) {
  this.onSuccess = onSuccess;
  this.form.reset();
  this.previewContainer.innerHTML = "";
  this.imageInput.value = ""; // reset file input

  if (categoryData) {
    document.getElementById("categoryId").value = categoryData._id;
    document.getElementById("categoryName").value = categoryData.name;
    if (categoryData.imageURL) {
      const img = document.createElement("img");
      img.src = categoryData.imageURL;
      img.style.maxWidth = "150px";
      this.previewContainer.appendChild(img);
    }
  }
  this.modal.classList.add("active");
}


  closeModal() {
    this.modal.classList.remove("active");
    this.form.reset();
    this.previewContainer.innerHTML = "";
  }

  async handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập.");
      window.location.href = "/login.html";
      return;
    }

    const categoryId = document.getElementById("categoryId").value;
    const name = document.getElementById("categoryName").value.trim();
    const file = this.imageInput.files[0];
    let imageURL = "";

    if (file) {
      try {
        imageURL = await uploadToCloudinary(file);
      } catch (err) {
        console.error("Upload ảnh lỗi:", err);
        alert("Upload ảnh thất bại");
        return;
      }
    }

    const categoryData = { name };
    if (imageURL) categoryData.imageURL = imageURL;

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
      alert("Có lỗi xảy ra khi gửi dữ liệu: " + error.message);
    }
  }
}
