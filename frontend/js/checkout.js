document.getElementById("checkout-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const token = localStorage.getItem("token");

  if (window.cartIsEmpty) {
    alert("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
    return;
  }

  const formData = new FormData(this);
  const fullName = formData.get("fullname");
  const phoneNumber = formData.get("phone");
  const fullAddress = formData.get("address");
  const note = formData.get("note");
  const paymentMethod = formData.get("paymentMethod");

  const cartRes = await fetch("http://127.0.0.1:5000/cart/get-current", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const cartData = await cartRes.json();

  const items = cartData.data.map(item => ({
    productId: item.product_id._id,
    name: item.product_id.name,
    quantity: item.quantity,
    price: item.product_id.price
  }));

  const subTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const payload = {
    shippingInfo: { fullName, phoneNumber, fullAddress, note },
    order: {
      items,
      subTotal,
      shippingFee: 0,
      discount: 0,
      totalAmount: subTotal
    },
    deliveryTime: "now",
    paymentMethod
  };

  const res = await fetch("http://127.0.0.1:5000/order/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  if (result.success) {
    const newOrder = {
      order: payload.order,
      shippingInfo: payload.shippingInfo,
      paymentMethod: payload.paymentMethod,
      createdAt: new Date().toISOString(),
      status: "pending",
      statusMessage: "Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý."
    };

    localStorage.setItem("lastOrder", JSON.stringify(newOrder));
    localStorage.setItem("selectedOrder", JSON.stringify(newOrder));

    const existingOrders = JSON.parse(localStorage.getItem("userOrders")) || [];
    existingOrders.push(newOrder);
    localStorage.setItem("userOrders", JSON.stringify(existingOrders));

    alert("Đặt hàng thành công!");
    window.location.href = "../success/success.html";
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const orderItems = document.getElementById("order-items");
  const orderTotal = document.getElementById("order-total");
  const subtotalField = document.getElementById("subtotal");

  const cartRes = await fetch("http://127.0.0.1:5000/cart/get-current", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const cartData = await cartRes.json();
  if (!cartData.success || cartData.data.length === 0) {
    orderItems.innerHTML = `<p>Giỏ hàng trống.</p>`;
    window.cartIsEmpty = true;
    return;
  }

  window.cartIsEmpty = false;

  let total = 0;
  cartData.data.forEach(item => {
    const { name, price, image_url } = item.product_id;
    const image = image_url || "../../assests/images/phukien.png";
    const quantity = item.quantity;
    const itemTotal = price * quantity;
    total += itemTotal;

    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <div class="item-image">
        <img src="${image}" alt="${name}" />
        <span class="quantity-badge">${quantity}</span>
      </div>
      <div class="item-info">
        <div class="item-name">${name}</div>
        <div class="item-total">${itemTotal.toLocaleString()}đ</div>
      </div>
    `;
    orderItems.appendChild(row);
  });

  subtotalField.innerText = `${total.toLocaleString()}đ`;
  orderTotal.innerHTML = `<strong>${total.toLocaleString()}đ</strong>`;
});
