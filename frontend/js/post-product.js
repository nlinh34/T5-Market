// frontend/pages/shop/post-products.js
import { ProductAPI } from "../APIs/productAPI.js";
import { CategoryAPI } from "../APIs/categoryAPI.js";
import { showNotification } from "../APIs/utils/notification.js";

document.addEventListener("DOMContentLoaded", async () => {
  const selectElement = document.querySelector("select[name='category']");
  const form = document.querySelector("form.content-box");
  const nameInput = form.querySelector("input[name='name']");
  const descriptionInput = form.querySelector("input[name='description']");
  const priceInput = form.querySelector("input[name='price']");
  const imageInput = document.getElementById("product-images");
  const imagePreviewContainer = document.getElementById("image-preview");
  const formTitle = document.getElementById("form-title");
  const submitButton = form.querySelector("button[type='submit']");

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id'); // Get product ID from URL if editing

  let existingImages = []; // To store image URLs for existing product

  const token = localStorage.getItem("token");
  if (!token) {
    showNotification("Vui lòng đăng nhập để đăng sản phẩm.", "error");
    return;
  }

  // Helper function to read file as Base64
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Handle image preview
  imageInput.addEventListener("change", (event) => {
    // Clear only file-based previews, keep existing image previews
    imagePreviewContainer.querySelectorAll('.file-preview-item').forEach(item => item.remove());

    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgDiv = document.createElement("div");
          imgDiv.classList.add("image-preview-item", "file-preview-item"); // Add a class to distinguish file previews
          imgDiv.innerHTML = `
            <img src="${e.target.result}" alt="Product Image" />
            <button type="button" class="remove-image-btn" data-name="${file.name}" data-type="new">&times;</button>
          `;
          imagePreviewContainer.appendChild(imgDiv);

          imgDiv.querySelector(".remove-image-btn").addEventListener("click", () => {
            const dt = new DataTransfer();
            const currentFiles = Array.from(imageInput.files);
            const fileToRemove = file.name;

            currentFiles.forEach((f) => {
              if (f.name !== fileToRemove) {
                dt.items.add(f);
              }
            });

            imageInput.files = dt.files;
            imgDiv.remove();
          });
        };
        reader.readAsDataURL(file);
      });
    }
  });

  function displayExistingImages(images) {
    imagePreviewContainer.innerHTML = ""; // Clear existing previews first
    existingImages = images; // Update existingImages array

    images.forEach(imageUrl => {
      const imgDiv = document.createElement("div");
      imgDiv.classList.add("image-preview-item", "existing-image-item"); // Add a class to distinguish existing image previews
      imgDiv.innerHTML = `
        <img src="${imageUrl}" alt="Product Image" />
        <button type="button" class="remove-image-btn" data-src="${imageUrl}" data-type="existing">&times;</button>
      `;
      imagePreviewContainer.appendChild(imgDiv);

      imgDiv.querySelector(".remove-image-btn").addEventListener("click", (e) => {
        const imageUrlToRemove = e.target.dataset.src;
        existingImages = existingImages.filter(url => url !== imageUrlToRemove);
        imgDiv.remove();
      });
    });
  }

  // --- Load danh mục và sản phẩm (nếu có ID) ---
  async function loadCategoriesAndProduct() {
    try {
      const categoriesResponse = await CategoryAPI.getAllCategories();
      if (categoriesResponse.success && Array.isArray(categoriesResponse.data)) {
        selectElement.innerHTML = '<option value="">Chọn danh mục</option>'; // Add default option
        categoriesResponse.data.forEach((category) => {
          const option = document.createElement("option");
          option.value = category._id;
          option.textContent = category.name;
          selectElement.appendChild(option);
        });
      } else {
        throw new Error("Không lấy được danh mục.");
      }

      if (productId) {
        formTitle.textContent = "Sửa sản phẩm";
        submitButton.textContent = "Cập nhật sản phẩm";
        const productResponse = await ProductAPI.getProductById(productId);
        if (productResponse.success && productResponse.data) {
          const product = productResponse.data;
          nameInput.value = product.name;
          descriptionInput.value = product.description;
          priceInput.value = product.price;
          selectElement.value = product.category._id; // Set selected category
          displayExistingImages(product.images); // Display existing images
        } else {
          showNotification("Không tìm thấy sản phẩm để sửa.", "error");
          // Optionally redirect back or disable form
          window.location.href = '/frontend/shop-manager.html?tab=cuaHang';
        }
      } else {
        formTitle.textContent = "Đăng sản phẩm mới";
        submitButton.textContent = "Đăng sản phẩm";
      }

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      showNotification(`Lỗi khi tải dữ liệu: ${error.message}`, "error");
      const errorOption = document.createElement("option");
      errorOption.disabled = true;
      errorOption.textContent = "Không thể tải danh mục.";
      selectElement.appendChild(errorOption);
    }
  }

  // --- Submit sản phẩm / Cập nhật sản phẩm ---
  async function handleFormSubmit(e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const price = priceInput.value.trim();
    const category = selectElement.value;

    let allImages = [...existingImages]; // Start with existing images

    const files = imageInput.files;
    for (let i = 0; i < files.length; i++) {
      allImages.push(await readFileAsBase64(files[i]));
    }

    if (!name || !description || !price || allImages.length === 0 || !category) {
      showNotification("Vui lòng điền đầy đủ thông tin và chọn ít nhất một hình ảnh.", "error");
      return;
    }

    const productData = {
      name,
      description,
      price: Number(price),
      images: allImages,
      category,
    };

    try {
      let response;
      if (productId) {
        // Update existing product
        response = await ProductAPI.updateProduct(productId, productData);
      } else {
        // Create new product
        response = await ProductAPI.createProduct(productData);
      }

      if (response.success) {
        showNotification(`✅ ${productId ? "Cập nhật" : "Đăng"} sản phẩm thành công! Đang chờ duyệt.`, "success");
        form.reset();
        imagePreviewContainer.innerHTML = ""; // Clear image previews
        existingImages = []; // Clear existing images array
        
        // Redirect to shop manager products tab after successful submission/update
        setTimeout(() => {
          window.location.href = '/frontend/shop-manager.html?tab=cuaHang';
        }, 1500);

      } else {
        showNotification(`❌ ${productId ? "Cập nhật" : "Đăng"} sản phẩm thất bại: ${response.error || "Không xác định"}`, "error");
      }
    } catch (error) {
      console.error("Lỗi khi gửi sản phẩm:", error);
      showNotification("❌ Có lỗi xảy ra khi xử lý sản phẩm.", "error");
    }
  }

  await loadCategoriesAndProduct();
  form.addEventListener("submit", handleFormSubmit);
});