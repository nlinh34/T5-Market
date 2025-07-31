import { OrderAPI } from "../APIs/orderAPI.js";

// Render sản phẩm
function renderOrderSummary(cartItems, orderItemsContainer, orderTotal, subtotalField, discountField) {
  let total = 0;
  orderItemsContainer.innerHTML = '';

  if (cartItems.length === 0) {
    orderItemsContainer.innerHTML = `<p>Giỏ hàng trống hoặc không có sản phẩm nào được chọn.</p>`;
    orderTotal.textContent = '0đ';
    subtotalField.textContent = '0đ';
    discountField.textContent = '0đ';
    window.cartIsEmpty = true;
    return;
  }

  window.cartIsEmpty = false;

  const groupedItems = cartItems.reduce((acc, item) => {
    const shopId = item.product.shop ? item.product.shop._id : 'unknown_shop';
    if (!acc[shopId]) {
      acc[shopId] = {
        shopName: item.product.shop ? item.product.shop.name : 'Cửa hàng không xác định',
        items: []
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  for (const shopId in groupedItems) {
    const shopGroup = groupedItems[shopId];
    const shopSection = document.createElement('div');
    shopSection.className = 'shop-group';
    shopSection.innerHTML = `<h3 class="shop-name">${shopGroup.shopName}</h3>`;

    const productListDiv = document.createElement('div');
    productListDiv.className = 'product-list';

    shopGroup.items.forEach(item => {
      const price = item.product.price;
      const quantity = item.quantity;
      const itemTotal = price * quantity;
      total += itemTotal;

      const rawImage = item.product.images?.[0];
      let image = "https://via.placeholder.com/100?text=No+Image";
      if (typeof rawImage === "string") {
        if (rawImage.startsWith("data:image") || rawImage.startsWith("http")) {
          image = rawImage;
        } else {
          image = `http://127.0.0.1:5000/uploads/${rawImage}`;
        }
      }

      const productRow = document.createElement("div");
      productRow.className = "checkout-order-item";
      productRow.innerHTML = `
        <div class="item-image">
          <img src="${image}" alt="${item.product.name}" />
          <span class="quantity-badge">${quantity}</span>
        </div>
        <div class="item-info">
          <div class="item-name">${item.product.name}</div>
          <div class="item-total">${itemTotal.toLocaleString()}đ</div>
        </div>
      `;
      productListDiv.appendChild(productRow);
    });

    shopSection.appendChild(productListDiv);
    orderItemsContainer.appendChild(shopSection);
  }

  const discount = parseFloat(localStorage.getItem("appliedDiscount") || "0");
  const finalTotal = total - discount;

  subtotalField.textContent = `${total.toLocaleString()}đ`;
  discountField.textContent = `${discount.toLocaleString()}đ`;
  orderTotal.textContent = `${finalTotal.toLocaleString()}đ`;
}

// Tải giỏ hàng và hiển thị
async function loadAndRenderOrderSummary() {
  const token = localStorage.getItem("token");
  const orderItemsContainer = document.getElementById("order-items");
  const orderTotal = document.getElementById("order-total");
  const subtotalField = document.getElementById("subtotal");
  const discountField = document.getElementById("discount");
  const selectedIds = JSON.parse(localStorage.getItem("selectedProductIds") || "[]");

  try {
    const cartRes = await fetch("http://127.0.0.1:5000/cart/", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cartData = await cartRes.json();

    if (!cartData.success || !cartData.cart || !cartData.cart.items) {
      console.error("Không thể tải giỏ hàng:", cartData.error || "Unknown error");
      renderOrderSummary([], orderItemsContainer, orderTotal, subtotalField, discountField);
      return;
    }

    const selectedItems = cartData.cart.items.filter(item =>
      selectedIds.includes(item.product._id)
    );

    renderOrderSummary(selectedItems, orderItemsContainer, orderTotal, subtotalField, discountField);
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
    renderOrderSummary([], orderItemsContainer, orderTotal, subtotalField, discountField);
  }
}

document.addEventListener("DOMContentLoaded", loadAndRenderOrderSummary);

// Xử lý submit form
document.getElementById("checkout-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Vui lòng đăng nhập để đặt hàng.");
    window.location.href = "../auth/login.html";
    return;
  }

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

  if (!fullName || !phoneNumber || !fullAddress) {
    alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.");
    return;
  }

  let itemsForApi = [];
  let finalTotal = 0;
  let subtotalBackend = 0;

  try {
    const cartRes = await fetch("http://127.0.0.1:5000/cart/", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cartData = await cartRes.json();

    if (!cartData.success || !cartData.cart?.items?.length) {
      alert("Không thể lấy dữ liệu giỏ hàng.");
      return;
    }

    itemsForApi = cartData.cart.items
      .filter(item => selectedIds.includes(item.product._id))
      .map(item => {
        const product = {
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        };
        const rawImage = item.product.images?.[0];
        if (typeof rawImage === "string" && rawImage.length > 0) {
          product.image = rawImage;
        }
        subtotalBackend += product.price * product.quantity;
        return product;
      });

    const discount = parseFloat(localStorage.getItem("appliedDiscount") || "0");
    finalTotal = subtotalBackend - discount;

  } catch (error) {
    alert("Lỗi khi xử lý giỏ hàng. Vui lòng thử lại.");
    console.error(error);
    return;
  }

  const orderData = {
    products: itemsForApi,
    shippingInfo: {
      fullName,
      address: fullAddress,
      phone: phoneNumber,
      note
    },
    paymentMethod,
    totalAmount: finalTotal
  };

  console.log("Dữ liệu orderData gửi đi:", orderData);

  try {
    const response = await OrderAPI.createOrder(orderData);

    if (response.success) {
      const newOrder = {
        ...response.data,
        products: itemsForApi,
        shippingInfo: orderData.shippingInfo,
        paymentMethod,
        createdAt: new Date().toISOString(),
        statusMessage: "Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý."
      };

      localStorage.setItem("lastOrder", JSON.stringify(newOrder));
      localStorage.setItem("selectedOrder", JSON.stringify(newOrder));

      const existingOrders = JSON.parse(localStorage.getItem("userOrders")) || [];
      existingOrders.push(newOrder);
      localStorage.setItem("userOrders", JSON.stringify(existingOrders));

      localStorage.removeItem("selectedProductIds");
      localStorage.removeItem("appliedCoupon");
      localStorage.removeItem("appliedDiscount");

      alert("Đặt hàng thành công!");
      window.location.href = "../success/success.html";
    } else {
      alert(`Đặt hàng thất bại: ${response.error || "Có lỗi xảy ra."}`);
      console.error("Order creation failed:", response);
    }
  } catch (error) {
    alert("Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại.");
    console.error("Error creating order:", error);
  }
});
