document.addEventListener("DOMContentLoaded", () => {
  const ordersBody = document.getElementById("orders-body");
  const filterSelect = document.createElement("select");
  filterSelect.innerHTML = `
    <option value="all">Tất cả</option>
    <option value="confirmed">Đã xác nhận</option>
    <option value="packing">Đang đóng gói</option>
    <option value="shipping">Đang giao</option>
    <option value="delivered">Đã nhận hàng</option>
    <option value="cancelled">Đã huỷ</option>
  `;
  filterSelect.style.marginBottom = "1rem";
  ordersBody.parentElement.parentElement.insertBefore(filterSelect, ordersBody.parentElement);

  let orders = JSON.parse(localStorage.getItem("userOrders")) || [];

  if (orders.length === 0) {
    ordersBody.innerHTML = '<tr><td colspan="7">Chưa có đơn hàng nào.</td></tr>';
    return;
  }

  const renderOrders = (filter = "all") => {
    ordersBody.innerHTML = "";

    const filteredOrders = orders.filter(order => {
      if (filter === "confirmed") return order.status === "confirmed";
      if (filter === "packing") return order.status === "packing";
      if (filter === "shipping") return order.status === "shipping";
      if (filter === "delivered") return order.status === "delivered";
      if (filter === "cancelled") return order.status === "cancelled";
      if (filter === "unconfirmed") return !order.status || order.status === "unconfirmed";
      return true;
    });

    if (filteredOrders.length === 0) {
      ordersBody.innerHTML = '<tr><td colspan="7">Không có đơn hàng phù hợp.</td></tr>';
      return;
    }

    filteredOrders.forEach((order, index) => {
      const { shippingInfo, paymentMethod, order: orderData, createdAt, status } = order;
      const { fullName, fullAddress } = shippingInfo;
      const productList = orderData.items.map(item => `${item.name} (x${item.quantity})`).join("<br>");

      let actionCell = "";
      if (status === "delivered") {
        actionCell = '<span style="color: green; font-weight: bold;">✅ Đã nhận hàng</span>';
      } else if (status === "shipping") {
        actionCell = `
          <button data-index="${index}" class="mark-delivered-btn">Đã nhận hàng</button>
          <button data-index="${index}" class="cancel-btn">Huỷ</button>
        `;
      } else if (status === "packing") {
        actionCell = `
          <button data-index="${index}" class="mark-shipping-btn">Đang giao hàng</button>
          <button data-index="${index}" class="cancel-btn">Huỷ</button>
        `;
      } else if (status === "confirmed") {
        actionCell = `
          <button data-index="${index}" class="mark-packing-btn">Đang đóng gói</button>
          <button data-index="${index}" class="cancel-btn">Huỷ</button>
        `;
      } else if (status === "cancelled") {
        actionCell = '<span style="color: red; font-weight: bold;">❌ Đã huỷ</span>';
      } else {
        actionCell = `<button data-index="${index}" class="confirm-btn">Xác nhận</button>
                       <button data-index="${index}" class="cancel-btn">Huỷ</button>`;
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(createdAt).toLocaleString()}</td>
        <td>${fullName}</td>
        <td>${fullAddress}</td>
        <td>${productList}</td>
        <td>${paymentMethod}</td>
        <td>${orderData.totalAmount.toLocaleString()}đ</td>
        <td>${actionCell}</td>
      `;

      ordersBody.appendChild(row);
    });

    document.querySelectorAll(".confirm-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        orders[index].status = "confirmed";
        orders[index].statusMessage = "Đơn hàng của bạn đã được xác nhận.";
        localStorage.setItem("userOrders", JSON.stringify(orders));
        renderOrders(filterSelect.value);
      });
    });

    document.querySelectorAll(".mark-packing-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        orders[index].status = "packing";
        orders[index].statusMessage = "Đơn hàng của bạn đang được đóng gói.";
        localStorage.setItem("userOrders", JSON.stringify(orders));
        renderOrders(filterSelect.value);
      });
    });

    document.querySelectorAll(".mark-shipping-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        orders[index].status = "shipping";
        orders[index].statusMessage = "Đơn hàng đang được giao đến bạn.";
        localStorage.setItem("userOrders", JSON.stringify(orders));
        renderOrders(filterSelect.value);
      });
    });

    document.querySelectorAll(".mark-delivered-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        orders[index].status = "delivered";
        orders[index].statusMessage = "Bạn đã nhận hàng. Cảm ơn đã mua sắm tại T5Market!";
        localStorage.setItem("userOrders", JSON.stringify(orders));
        renderOrders(filterSelect.value);
      });
    });

    document.querySelectorAll(".cancel-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        const confirmCancel = confirm("Bạn có chắc muốn huỷ đơn hàng này?");
        if (confirmCancel) {
          orders[index].status = "cancelled";
          orders[index].statusMessage = "Đơn hàng đã bị huỷ.";
          localStorage.setItem("userOrders", JSON.stringify(orders));
          renderOrders(filterSelect.value);
        }
      });
    });
  };

  filterSelect.addEventListener("change", () => {
    renderOrders(filterSelect.value);
  });

  renderOrders();
});