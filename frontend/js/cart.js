document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const selectAllCheckbox = document.getElementById("select-all");

  let discount = 0;
  window.cartIsEmpty = true;

  async function fetchCart() {
    const res = await fetch("http://127.0.0.1:5000/cart/get-current", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    return result.success ? result.data : [];
  }

  async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;
    await fetch("http://127.0.0.1:5000/cart/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity: newQuantity })
    });
    const cart = await fetchCart();
    renderCart(cart);
  }

  async function deleteItem(productId) {
    await fetch(`http://127.0.0.1:5000/cart/delete/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const cart = await fetchCart();
    renderCart(cart);
  }

  function renderCart(cartItems) {
    const totalProductsEl = document.getElementById("total-products");
    if (totalProductsEl) totalProductsEl.textContent = cartItems.length;

    tbody.innerHTML = "";
    window.cartIsEmpty = cartItems.length === 0;

    cartItems.forEach(item => {
      const {
        name,
        price,
        image_url: rawImage,
        _id
      } = item.product_id;

      const quantity = item.quantity;
      const image = rawImage?.startsWith("http")
        ? rawImage
        : rawImage
        ? `http://127.0.0.1:5000/uploads/${rawImage}`
        : "https://via.placeholder.com/100?text=No+Image";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" class="select-product" data-id="${_id}" data-price="${price}" data-qty="${quantity}" /></td>
        <td>
          <div class="cart-item-info">
            <img src="${image}" alt="${name}" class="cart-product-image" />
            <span class="cart-product-name">${name}</span>
          </div>
        </td>
        <td><span>${price.toLocaleString()}₫</span></td>
        <td>
          <div class="cart-product-actions">
            <button class="decrease-btn" data-id="${_id}">−</button>
            <span class="quantity">${quantity}</span>
            <button class="increase-btn" data-id="${_id}">+</button>
          </div>
        </td>
        <td><strong>${(price * quantity).toLocaleString()}₫</strong></td>
        <td><button class="cart-delete-btn" data-id="${_id}"><i class="fas fa-trash"></i></button></td>
      `;

      tbody.appendChild(row);
    });

    document.querySelectorAll(".cart-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteItem(btn.dataset.id));
    });

    document.querySelectorAll(".increase-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.id;
        const currentQty = parseInt(btn.previousElementSibling.textContent);
        updateQuantity(productId, currentQty + 1);
      });
    });

    document.querySelectorAll(".decrease-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.id;
        const currentQty = parseInt(btn.nextElementSibling.textContent);
        updateQuantity(productId, currentQty - 1);
      });
    });

    document.querySelectorAll(".select-product").forEach(cb => {
      cb.addEventListener("change", updateSelectedTotal);
    });

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", () => {
        document.querySelectorAll(".select-product").forEach(cb => {
          cb.checked = selectAllCheckbox.checked;
        });
        updateSelectedTotal();
      });
    }

    updateSelectedTotal();
  }

  function updateSelectedTotal() {
  const couponCode = document.getElementById("coupon-input")?.value.trim();
  discount = 0;

  const checkboxes = document.querySelectorAll(".select-product:checked");
  let subtotal = 0;
  const selectedIds = [];

  checkboxes.forEach(cb => {
    const price = parseFloat(cb.dataset.price);
    const qty = parseInt(cb.dataset.qty);
    subtotal += price * qty;
    selectedIds.push(cb.dataset.id);
  });

  // Lưu danh sách ID sản phẩm đã chọn
  localStorage.setItem("selectedProductIds", JSON.stringify(selectedIds));

  // Tính discount và lưu vào localStorage
  if (couponCode && couponCode.toLowerCase() === "t5market") {
    discount = subtotal * 0.2;
    localStorage.setItem("appliedCoupon", "t5market");
    localStorage.setItem("appliedDiscount", discount);
  } else {
    localStorage.removeItem("appliedCoupon");
    localStorage.setItem("appliedDiscount", "0");
  }

  const finalTotal = subtotal - discount;

  subtotalEl.textContent = subtotal.toLocaleString() + "₫";
  const discountEl = document.getElementById("discount");
  if (discountEl) discountEl.textContent = discount.toLocaleString() + "₫";
  totalEl.textContent = finalTotal.toLocaleString() + "₫";

  window.cartIsEmpty = checkboxes.length === 0;
}


  const cart = await fetchCart();
  renderCart(cart);

  document.getElementById("apply-coupon").addEventListener("click", function () {
    updateSelectedTotal();
  });

  document.getElementById("checkout-btn").addEventListener("click", function (e) {
    e.preventDefault();
    if (window.cartIsEmpty) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
    } else {
      window.location.href = "./checkout.html";
    }
  });
});
