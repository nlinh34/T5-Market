document.getElementById("checkout-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const selectedIds = JSON.parse(localStorage.getItem("selectedProductIds") || "[]");
  if (selectedIds.length === 0) {
    alert("Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm trước khi thanh toán.");
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

  // Tạo items để gửi API (KHÔNG chứa image_url)
  const itemsForApi = cartData.data
    .filter(item => selectedIds.includes(item.product_id._id))
    .map(item => ({
      productId: item.product_id._id,
      name: item.product_id.name,
      quantity: item.quantity,
      price: item.product_id.price
    }));

  // Tạo items để lưu localStorage (CÓ chứa image_url)
  const itemsForLocalStorage = cartData.data
    .filter(item => selectedIds.includes(item.product_id._id))
    .map(item => ({
      productId: item.product_id._id,
      name: item.product_id.name,
      quantity: item.quantity,
      price: item.product_id.price,
      image_url: item.product_id.image_url || ""
    }));

  const subTotal = itemsForApi.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = parseFloat(localStorage.getItem("appliedDiscount") || "0");
  const totalAmount = subTotal - discount;

  const payload = {
    shippingInfo: { fullName, phoneNumber, fullAddress, note },
    order: {
      items: itemsForApi,
      subTotal,
      shippingFee: 0,
      discount,
      totalAmount
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
      order: {
        ...payload.order,
        items: itemsForLocalStorage // lưu items kèm image_url
      },
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

    localStorage.removeItem("selectedProductIds"); // Xoá ID đã chọn
    localStorage.removeItem("appliedCoupon");
    localStorage.removeItem("appliedDiscount");

    alert("Đặt hàng thành công!");
    window.location.href = "../success/success.html";
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const orderItems = document.getElementById("order-items");
  const orderTotal = document.getElementById("order-total");
  const subtotalField = document.getElementById("subtotal");
  const discountField = document.getElementById("discount");

  const selectedIds = JSON.parse(localStorage.getItem("selectedProductIds") || "[]");

  const cartRes = await fetch("http://127.0.0.1:5000/cart/get-current", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const cartData = await cartRes.json();
  if (!cartData.success || cartData.data.length === 0 || selectedIds.length === 0) {
    orderItems.innerHTML = `<p>Giỏ hàng trống.</p>`;
    window.cartIsEmpty = true;
    return;
  }

  const selectedItems = cartData.data.filter(item => selectedIds.includes(item.product_id._id));
  window.cartIsEmpty = false;

  let total = 0;
  selectedItems.forEach(item => {
    const { name, price, image_url } = item.product_id;
    const quantity = item.quantity;
    const itemTotal = price * quantity;
    total += itemTotal;

    const image = image_url?.startsWith("http")
      ? image_url
      : image_url
      ? `http://127.0.0.1:5000/uploads/${image_url}`
      : "https://via.placeholder.com/100?text=No+Image";

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

  const discount = parseFloat(localStorage.getItem("appliedDiscount") || "0");
  const finalTotal = total - discount;

  subtotalField.innerText = `${total.toLocaleString()}đ`;
  if (discountField) discountField.innerText = `${discount.toLocaleString()}đ`;
  orderTotal.innerHTML = `<strong>${finalTotal.toLocaleString()}đ</strong>`;
});
