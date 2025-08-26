import OrderAPI from "../APIs/orderAPI.js";
import CartAPI from "../APIs/cartAPI.js";

function renderOrderSummaryFromLocal() {
  const container = document.getElementById("order-items");
  const selectedItems = JSON.parse(localStorage.getItem("selectedCartItems") || "[]");

  if (!selectedItems.length) {
    container.innerHTML = `<p>Không có sản phẩm nào được chọn.</p>`;
    updateSummaryUI(0, 0);
    return;
  }

  let subtotal = 0;
  const html = selectedItems.map(item => {
    const total = item.qty * item.price;
    subtotal += total;

    return `
      <div class="order-item">
        <img loading="lazy" src="${item.image}" alt="${item.name}" />
        <div class="order-item-details">
          <div class="name-prod">${item.name}</div>
          <div>SL: ${item.qty}</div>
          <div>Thành tiền: ${total.toLocaleString()}₫</div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;

  const discountAmount = getDiscountAmount(subtotal);
  updateSummaryUI(subtotal, discountAmount);
}

function updateSummaryUI(subtotal, discount) {
  const total = subtotal - discount;
  document.getElementById("subtotal").textContent = `${subtotal.toLocaleString()}₫`;
  document.getElementById("discount").textContent = `${discount.toLocaleString()}₫`;
  document.getElementById("order-total").textContent = `${total.toLocaleString()}₫`;
}

function getDiscountAmount(subtotal) {
  const code = localStorage.getItem("appliedCoupon");
  return code === "t5market" ? subtotal * 0.2 : 0;
}


async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập để đặt hàng.");
    return window.location.href = "../auth/login.html";
  }

   let selectedIds = JSON.parse(localStorage.getItem("selectedProductIds") || "[]");
  selectedIds = selectedIds.map(id => id?.toString().trim());

  if (!selectedIds.length) {
    alert("Vui lòng chọn sản phẩm để đặt hàng.");
    return;
  }

  const formData = new FormData(e.target);
  const shippingInfo = {
    fullName: formData.get("fullname"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    note: formData.get("note")
  };
  const paymentMethod = formData.get("paymentMethod");

  if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
    return alert("Vui lòng điền đầy đủ thông tin giao hàng.");
  }

  try {
    const res = await CartAPI.getCart();
if (!res.success || !res.cart) {
  console.warn("❌ Không có giỏ hàng hoặc lỗi server");
  return;
}

const items = res.cart.items || [];
const total = res.cart.total || 0;

    const selectedItems = [];

for (const item of items) {
  const productId = item?.product?._id?.toString().trim();
  if (!productId) {
    console.warn("❗Không tìm thấy _id trong product:", item.product);
    continue;
  }

  const match = selectedIds.includes(productId);

  if (match) {
    selectedItems.push(item);
  }
}


    if (!selectedItems.length) {
      return alert("Danh sách sản phẩm không hợp lệ.");
    }

    const discount = parseFloat(localStorage.getItem("appliedDiscount") || "0");
    let subtotal = 0;

    const products = selectedItems.map(item => {
      const { _id, name, price, images } = item.product;
      const product = {
        productId: _id,
        name,
        price,
        quantity: item.quantity,
        image: images?.[0] || ""
      };
      subtotal += price * item.quantity;
      return product;
    });

    const orderData = {
      products,
      shippingInfo,
      paymentMethod,
      totalAmount: subtotal - discount
    };

    const response = await OrderAPI.createOrder(orderData);

    if (response.success) {
      const newOrder = {
        ...response.data,
        products,
        shippingInfo,
        paymentMethod,
        createdAt: new Date().toISOString(),
        statusMessage: "Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý."
      };

      // Lưu đơn hàng vào local
      const existing = JSON.parse(localStorage.getItem("userOrders") || "[]");
      existing.push(newOrder);
      localStorage.setItem("userOrders", JSON.stringify(existing));
      localStorage.setItem("lastOrder", JSON.stringify(newOrder));
      localStorage.setItem("selectedOrder", JSON.stringify(newOrder));

      // Xoá các thông tin tạm
      localStorage.removeItem("selectedProductIds");
      localStorage.removeItem("appliedCoupon");
      localStorage.removeItem("appliedDiscount");

      alert("Đặt hàng thành công!");
      window.location.href = "./success.html";
    } else {
      alert(`Đặt hàng thất bại: ${response.error}`);
    }
  } catch (err) {
    console.error("❌ Lỗi khi gửi đơn:", err);
    alert("Lỗi khi xử lý đơn hàng.");
  }
}


document.addEventListener("DOMContentLoaded", renderOrderSummaryFromLocal);
document.getElementById("checkout-form").addEventListener("submit", handleCheckoutSubmit);
