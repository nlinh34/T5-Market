document.addEventListener("DOMContentLoaded", async () => {
  const selectElement = document.querySelector("select[name='category']");
  const form = document.querySelector("form.content-box");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập để đăng sản phẩm.");
    return;
  }

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
    const image_url = form.querySelector("input[name='image_url']").value.trim();
    const category = selectElement.value;

    if (!name || !description || !price || !image_url || !category) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
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
          image_url,
          category, // đây là _id
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Đăng sản phẩm thành công!");
        form.reset();
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
