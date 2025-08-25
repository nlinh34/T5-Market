import { ProductAPI } from "../APIs/productAPI.js";
import { CategoryAPI } from "../APIs/categoryAPI.js";
import { showNotification } from "../APIs/utils/notification.js";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dipcjvi8x/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "t5market_assets";

// Hàm upload 1 ảnh lên Cloudinary
async function uploadToCloudinary(base64Image) {
    const formData = new FormData();
    formData.append("file", base64Image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.secure_url) {
        throw new Error("Upload ảnh thất bại");
    }

    return data.secure_url;
}

document.addEventListener("DOMContentLoaded", async () => {
    const MAX_IMAGE_COUNT = 5;

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
    const productId = urlParams.get('id');

    let existingImages = [];

    const token = localStorage.getItem("token");
    if (!token) {
        showNotification("Vui lòng đăng nhập để đăng sản phẩm.", "error");
        return;
    }

    function compressAndReadFileAsBase64(file, quality = 0.6, maxWidth = 800) {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality,
                maxWidth,
                convertSize: 500000,
                success(result) {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(result);
                },
                error(err) {
                    reject(err);
                }
            });
        });
    }

    imageInput.addEventListener("change", (event) => {
        const files = event.target.files;

        if ((existingImages.length + files.length) > MAX_IMAGE_COUNT) {
            showNotification(`Bạn chỉ được chọn tối đa ${MAX_IMAGE_COUNT} ảnh (bao gồm ảnh đã có).`, "error");
            imageInput.value = "";
            return;
        }

        imagePreviewContainer.querySelectorAll('.file-preview-item').forEach(item => item.remove());

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgDiv = document.createElement("div");
                imgDiv.classList.add("image-preview-item", "file-preview-item");
                imgDiv.innerHTML = `
          <img loading="lazy" src="${e.target.result}" alt="Product Image" />
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
    });

    function displayExistingImages(images) {
        imagePreviewContainer.innerHTML = "";
        existingImages = images;

        images.forEach(imageUrl => {
            const imgDiv = document.createElement("div");
            imgDiv.classList.add("image-preview-item", "existing-image-item");
            imgDiv.innerHTML = `
        <img loading="lazy" src="${imageUrl}" alt="Product Image" />
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

    async function handleFormSubmit(e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const price = priceInput.value.trim();
        const category = selectElement.value;
        const files = imageInput.files;

        if ((existingImages.length + files.length) > MAX_IMAGE_COUNT) {
            showNotification(`Tổng số ảnh không được vượt quá ${MAX_IMAGE_COUNT}.`, "error");
            return;
        }

        let allImages = [...existingImages];

        for (let i = 0; i < files.length; i++) {
            try {
                const compressedBase64 = await compressAndReadFileAsBase64(files[i]);
                const uploadedUrl = await uploadToCloudinary(compressedBase64);
                allImages.push(uploadedUrl);
            } catch (err) {
                console.error("Upload ảnh lỗi:", err);
                showNotification("Upload ảnh thất bại.", "error");
                return;
            }
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
                response = await ProductAPI.updateProduct(productId, productData);
            } else {
                response = await ProductAPI.createProduct(productData);
            }

            if (response.success) {
                showNotification("Sản phẩm đã đăng!", "success");
                form.reset();
                imagePreviewContainer.innerHTML = "";
                existingImages = [];
                setTimeout(() => {
                    window.location.href = '/frontend/shop-manager.html?tab=cuaHang';
                }, 1500);
            } else {
                showNotification(`${productId ? "Cập nhật" : "Đăng"} sản phẩm thất bại.`, "error");
            }
        } catch (error) {
            console.error("Lỗi submit:", error);

            if (error && error.response && error.response.data && error.response.data.error) {
                showNotification(`${error.response.data.error}`, "error");
            } else {
                showNotification("Lỗi khi gửi dữ liệu.", "error");
            }
        }
    }

    async function loadCategoriesAndProduct() {
        try {
            const categoriesResponse = await CategoryAPI.getAllCategories();
            if (categoriesResponse.success && Array.isArray(categoriesResponse.data)) {
                selectElement.innerHTML = '<option value="">Chọn danh mục</option>';
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
                    selectElement.value = product.category._id;
                    displayExistingImages(product.images);
                } else {
                    showNotification("Không tìm thấy sản phẩm để sửa.", "error");
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

    await loadCategoriesAndProduct();
    form.addEventListener("submit", handleFormSubmit);
});