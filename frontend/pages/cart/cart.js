document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const taxEl = document.getElementById("tax");
  const totalEl = document.getElementById("total");

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
    tbody.innerHTML = "";
    let subtotal = 0;
    window.cartIsEmpty = cartItems.length === 0;

    cartItems.forEach(item => {
      const {
        name,
        price,
        image_url: rawImage,
        _id,
        description
      } = item.product_id;

      let image;
      if (!rawImage) {
        image = "https://via.placeholder.com/100?text=No+Image";
      } else if (rawImage.startsWith("http")) {
        image = rawImage;
      } else {
        image = `http://127.0.0.1:5000/uploads/${rawImage}`;
      }

      const quantity = item.quantity;
      const total = price * quantity;
      subtotal += total;

  const row = document.createElement("tr");
row.innerHTML = `
  <td colspan="5">
    <div class="cart-product-box">
      <div class="cart-image-wrapper">
        <img src="${image}" alt="${name}" class="cart-product-image" />
      </div>
      <button class="cart-delete-btn" data-id="${_id}">&times;</button>
      <div class="cart-product-body">
        <div class="cart-product-header">
          <div class="cart-product-left">
            <div class="cart-product-name">${name}</div>
            ${description ? `<div class="cart-product-desc">${description}</div>` : ''}
          </div>
          <div class="cart-product-right">
            <div class="cart-product-price"><strong>${price.toLocaleString()}₫</strong></div>
            <div class="cart-product-actions">
              <button class="decrease-btn" data-id="${_id}">−</button>
              <span class="quantity">${quantity}</span>
              <button class="increase-btn" data-id="${_id}">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </td>
`;



      tbody.appendChild(row);
    });

    const tax = subtotal * 0.05;
    const finalTotal = subtotal + tax - discount;

    subtotalEl.textContent = subtotal.toLocaleString() + "₫";
    discountEl.textContent = discount.toLocaleString() + "₫";
    taxEl.textContent = tax.toLocaleString() + "₫";
    totalEl.textContent = finalTotal.toLocaleString() + "₫";

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
  }

  const cart = await fetchCart();
  renderCart(cart);

  document.getElementById("checkout-btn").addEventListener("click", function (e) {
    e.preventDefault();
    if (window.cartIsEmpty) {
      alert("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
    } else {
      window.location.href = "../checkout/checkout.html";
    }
  });
});
