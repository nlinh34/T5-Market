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
      const { name, price, _id } = item.product_id;
      const quantity = item.quantity;
      const total = price * quantity;
      subtotal += total;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${name}</td>
        <td>${price.toLocaleString()}đ</td>
        <td>
          <button class="decrease-btn" data-id="${_id}">-</button>
          <span class="quantity">${quantity}</span>
          <button class="increase-btn" data-id="${_id}">+</button>
        </td>
        <td>${total.toLocaleString()}đ</td>
        <td><button class="delete-btn" data-id="${_id}">Xoá</button></td>
      `;
      tbody.appendChild(row);
    });

    const tax = subtotal * 0.05;
    const finalTotal = subtotal + tax - discount;

    subtotalEl.textContent = subtotal.toLocaleString() + "đ";
    discountEl.textContent = discount.toLocaleString() + "đ";
    taxEl.textContent = tax.toLocaleString() + "đ";
    totalEl.textContent = finalTotal.toLocaleString() + "đ";

    // Gắn sự kiện
    document.querySelectorAll(".delete-btn").forEach(btn => {
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
