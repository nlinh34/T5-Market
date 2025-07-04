import { ProductAPI } from "../../APIs/productAPI.js";

export class ProductForm {
  constructor() {
    this.modal = document.getElementById("productModal");
    this.form = document.getElementById("productForm");
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

  openModal(productData = null, onSuccess = null) {
    this.onSuccess = onSuccess; // Callback function sau khi thêm/sửa thành công
    this.form.reset();

    if (productData) {
      // Điền dữ liệu vào form nếu là edit
      document.getElementById("productId").value = productData._id;
      document.getElementById("productCode").value = productData.productCode;
      document.getElementById("productName").value = productData.name;
      document.getElementById("productPrice").value = productData.price;
      document.getElementById("productCategory").value = productData.category;
      document.getElementById("productDescription").value =
        productData.description;
      document.getElementById("productImage").value = productData.image_url;
      document.getElementById("isPopular").checked = productData.isPopular;
      document.getElementById("modalTitle").textContent = "Cập Nhật Sản Phẩm";
    } else {
      // Reset form nếu là thêm mới
      document.getElementById("productId").value = "";
      document.getElementById("modalTitle").textContent = "Thêm Sản Phẩm Mới";
    }
    this.modal.style.display = "block";
  }

  closeModal() {
    this.modal.style.display = "none";
    this.form.reset();
  }

  async handleSubmit(e) {
    e.preventDefault();

    const productData = {
      productCode: document.getElementById("productCode").value,
      name: document.getElementById("productName").value,
      price: Number(document.getElementById("productPrice").value),
      category: document.getElementById("productCategory").value,
      description: document.getElementById("productDescription").value,
      image_url: document.getElementById("productImage").value,
      isPopular: document.getElementById("isPopular").checked,
    };

    const productId = document.getElementById("productId").value;

    try {
      let result;
      if (productId) {
        // Cập nhật sản phẩm
        result = await ProductAPI.updateProduct(productId, productData);
      } else {
        // Thêm sản phẩm mới
        result = await ProductAPI.createProduct(productData);
      }

      if (result.success) {
        this.closeModal();
        // Gọi callback function nếu có
        if (this.onSuccess) {
          this.onSuccess();
        }
      } else {
        alert(result.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Có lỗi xảy ra khi lưu sản phẩm!");
    }
  }
}
