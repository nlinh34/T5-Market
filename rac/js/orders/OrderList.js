// js/orders/OrderList.js
export class OrderList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.token = localStorage.getItem("token");
    this.loadOrders();
  }

  async loadOrders() {
    if (!this.token) {
      this.container.innerHTML = "<p>Bạn chưa đăng nhập.</p>";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/order/all", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.orders) throw new Error(data.error || "Không thể tải đơn hàng");

      this.renderTable(data.orders);
    } catch (err) {
      this.container.innerHTML = `<p class="error">Lỗi: ${err.message}</p>`;
    }
  }

  renderTable(orders) {
    if (!orders.length) {
      this.container.innerHTML = "<p>Không có đơn hàng nào.</p>";
      return;
    }

    const table = document.createElement("table");
    table.classList.add("admin-table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Khách hàng</th>
          <th>SĐT</th>
          <th>Địa chỉ</th>
          <th>Sản phẩm</th>
          <th>Phương thức</th>
          <th>Tổng tiền</th>
          <th>Ngày đặt</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>${o.shippingInfo.fullName}</td>
            <td>${o.shippingInfo.phoneNumber}</td>
            <td>${o.shippingInfo.fullAddress}</td>
            <td>${o.order.items.map(i => `${i.name} x${i.quantity}`).join("<br>")}</td>
            <td>${o.paymentMethod}</td>
            <td>${o.order.totalAmount.toLocaleString()}đ</td>
            <td>${new Date(o.createdAt).toLocaleString("vi-VN")}</td>
          </tr>
        `).join("")}
      </tbody>
    `;

    this.container.innerHTML = "<h3>📦 Danh sách đơn hàng</h3>";
    this.container.appendChild(table);
  }
}
