document.addEventListener("DOMContentLoaded", async () => {
  const selectElement = document.querySelector("select[name='category']");
  const form = document.querySelector("form.content-box");
  const imageInput = document.getElementById("product-images");
  const imagePreviewContainer = document.getElementById("image-preview");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập để đăng sản phẩm.");
    return;
  }

  // Handle image preview
  imageInput.addEventListener("change", (event) => {
    imagePreviewContainer.innerHTML = ""; // Clear previous previews
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgDiv = document.createElement("div");
          imgDiv.classList.add("image-preview-item");
          imgDiv.innerHTML = `
            <img src="${e.target.result}" alt="Product Image" />
            <button type="button" class="remove-image-btn" data-name="${file.name}">&times;</button>
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

  // --- Load danh mục ---
  async function loadCategories() {
    try {
      const response = await fetch("https://t5-market.onrender.com/categories/get-all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Categories loaded:", data);

      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((category) => {
          const option = document.createElement("option");
          option.value = category._id;
          option.textContent = category.name;
          selectElement.appendChild(option);
        });
      } else {
        throw new Error("Không lấy được danh mục.");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      const errorOption = document.createElement("option");
      errorOption.disabled = true;
      errorOption.textContent = "Không thể tải danh mục.";
      selectElement.appendChild(errorOption);
    }
  }

  // --- Submit sản phẩm ---
  async function handleFormSubmit(e) {
    e.preventDefault();

    const name = form.querySelector("input[name='name']").value.trim();
    const description = form.querySelector("input[name='description']").value.trim();
    const price = form.querySelector("input[name='price']").value.trim();
    const category = selectElement.value;

    const images = [];
    const files = imageInput.files;
    for (let i = 0; i < files.length; i++) {
      images.push(await readFileAsBase64(files[i]));
    }

    if (!name || !description || !price || images.length === 0 || !category) {
      alert("Vui lòng điền đầy đủ thông tin và chọn ít nhất một hình ảnh.");
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

    try {
      const res = await fetch("https://t5-market.onrender.com/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          images, // đây là mảng các chuỗi Base64
          category, // đây là _id
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Đăng sản phẩm thành công!");
        form.reset();
        imagePreviewContainer.innerHTML = ""; // Clear image previews after successful submission
      } else {
        alert(result.message || "❌ Đăng sản phẩm thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi sản phẩm:", error);
      alert("❌ Có lỗi xảy ra khi đăng sản phẩm.");
    }
  }

  await loadCategories();
  form.addEventListener("submit", handleFormSubmit);
});