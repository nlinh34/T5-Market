import OrderAPI from "../APIs/orderAPI.js";

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".sidebar-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const cancelModal = document.getElementById("cancel-modal");
  const orderDetailModal = document.getElementById("order-detail-modal");

  let orders = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  init();

  async function init() {
    bindTabEvents();
    await loadOrdersFromAPI();
    renderAllTabs();
    bindModalEvents();
  }

  function bindTabEvents() {
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");

        const selectedTab = btn.dataset.tab;
        document.getElementById(`tab-${selectedTab}`).classList.add("active");
        currentPage = 1;
        renderTab(selectedTab, selectedTab === "all" ? currentPage : undefined);
      });
    });
  }

  async function loadOrdersFromAPI() {
    const res = await OrderAPI.getUserOrders();
    if (res.success) {
      orders = res.data;
      localStorage.setItem("userOrders", JSON.stringify(orders));
    } else {
      console.error("Không thể lấy đơn hàng từ API:", res.error);
      alert("Không thể tải danh sách đơn hàng.");
    }
  }

  function renderAllTabs() {
    ["pending", "packing", "shipping", "delivered", "cancelled"].forEach(renderTab);
    renderTab("all", currentPage);
  }

  function renderTab(type, page = 1) {
    const container = document.getElementById(`tab-${type}`);
    let html = `<div class="table-wrapper"><table class="order-table"><thead><tr>
      <th>Mã đơn</th><th>Ngày</th><th>Tên KH</th><th>Thanh toán</th><th>Trạng thái</th>`;

    if (type === "all") html += `<th>Thao tác</th>`;
    html += `</tr></thead><tbody>`;

    const filtered = orders
      .map((o, i) => ({ ...o, _index: i }))
      .filter((order) => type === "all" || (order.status || "pending") === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalPages = type === "all" ? Math.ceil(filtered.length / itemsPerPage) : 1;
    const paginated = type === "all" ? filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage) : filtered;

    if (paginated.length === 0) {
      html += `<tr><td colspan="6">Không có đơn hàng.</td></tr>`;
    } else {
      paginated.forEach((order) => {
        const idx = order._index;
        html += `<tr>
          <td>${order.orderCode}</td>
          <td>${new Date(order.createdAt).toLocaleString()}</td>
          <td>${order.shippingInfo?.fullName || ""}</td>
          <td>${order.paymentMethod || ""}</td>
          <td><span class="status-label status-${order.status}">${getStatusLabel(order.status)}</span></td>`;

        if (type === "all") {
          html += `<td><div class="order-actions">
            <button class="view-detail-btn" data-index="${idx}"><i class="fa fa-eye" aria-hidden="true"></i></button>`;
          if (!["cancelled", "delivered"].includes(order.status)) {
            html += `<button class="cancel-btn" data-index="${idx}">Hủy đơn</button>`;
          }
          html += `</div></td>`;
        }

        html += `</tr>`;
      });
    }

    html += `</tbody></table></div>`;

    if (type === "all" && totalPages > 1) {
      html += `<div class="pagination" style="margin-top:10px; display:flex; justify-content:center; gap:6px;">`;
      if (page > 1) html += `<button class="page-btn" data-page="${page - 1}">← Trước</button>`;
      html += `<span>Trang ${page} / ${totalPages}</span>`;
      if (page < totalPages) html += `<button class="page-btn" data-page="${page + 1}">Sau →</button>`;
      html += `</div>`;
    }

    container.innerHTML = html;

    if (type === "all") {
      bindActionButtons();
    }
  }

  function bindActionButtons() {
    document.querySelectorAll(".cancel-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        document.getElementById("cancel-reason").value = "";
        cancelModal.style.display = "flex";
        document.getElementById("cancel-confirm").onclick = () => confirmCancel(idx);
      });
    });

    document.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const newPage = parseInt(btn.dataset.page);
        renderTab("all", newPage);
      });
    });

    document.querySelectorAll(".view-detail-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        showOrderDetail(orders[idx]);
      });
    });
  }

  function showOrderDetail(order) {
    const itemsHtml = order.order?.items?.map(item => {
      const image = item.image_url?.startsWith("http")
        ? item.image_url
        : item.image_url
          ? `https://t5-market.onrender.com/uploads/${item.image_url}`
          : "https://via.placeholder.com/80x80?text=No+Image";
      return `<div class="product-row">
        <img loading="lazy" src="${image}" alt="${item.name}" class="product-img" />
        <div class="product-info">
          <div class="product-name">${item.name}</div>
          <div class="product-qty">Số lượng: <strong>${item.quantity}</strong></div>
          <div class="product-price">${item.price.toLocaleString()}đ</div>
        </div>
      </div>`;
    }).join("") || "";

    const sub = order.order?.subTotal || 0;
    const discount = order.order?.discount || 0;
    const total = order.order?.totalAmount || sub;

    document.getElementById("order-detail-content").innerHTML = `
      <h3><i class="fas fa-receipt"></i> Chi tiết đơn hàng</h3>
      <p><strong>Tên KH:</strong> ${order.shippingInfo?.fullName || ""}</p>
      <p><strong>SĐT:</strong> ${order.shippingInfo?.phoneNumber || ""}</p>
      <p><strong>Địa chỉ:</strong> ${order.shippingInfo?.fullAddress || ""}</p>
      <p><strong>Ghi chú:</strong> ${order.shippingInfo?.note || ""}</p>
      <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod || ""}</p>
      <h4><i class="fas fa-box-open"></i> Sản phẩm đã đặt</h4>
      <div class="product-list">${itemsHtml}</div>
      <hr/>
      <div class="summary-row"><span>Tạm tính:</span><strong>${sub.toLocaleString()}đ</strong></div>
      <div class="summary-row"><span>Đã giảm:</span><strong>${discount.toLocaleString()}đ</strong></div>
      <div class="summary-row total"><span>Tổng tiền:</span><strong>${total.toLocaleString()}đ</strong></div>
    `;
    orderDetailModal.style.display = "flex";
  }

  async function confirmCancel(index) {
    const reasonInput = document.getElementById("cancel-reason");
    const reason = reasonInput.value.trim();
    if (!reason) return alert("Vui lòng nhập lý do.");

    const order = orders[index];
    const orderId = order._id; // kiểm tra lại nếu key ID là khác

    try {
      const { success, error } = await OrderAPI.cancelOrder(orderId, reason);
      if (!success) return alert("Hủy đơn thất bại: " + error);

      // Cập nhật lại local data sau khi API thành công
      order.status = "cancelled";
      order.cancelReason = reason;
      localStorage.setItem("userOrders", JSON.stringify(orders));

      cancelModal.style.display = "none";
      renderAllTabs();
    } catch (err) {
      console.error("Lỗi khi hủy đơn:", err);
      alert("Đã xảy ra lỗi khi hủy đơn. Vui lòng thử lại.");
    }
  }


  function bindModalEvents() {
    document.getElementById("cancel-close").onclick = () => cancelModal.style.display = "none";
    cancelModal.addEventListener("click", (e) => { if (e.target.id === "cancel-modal") cancelModal.style.display = "none"; });

    document.querySelector("#order-detail-modal .modal-close").onclick = () => orderDetailModal.style.display = "none";
    orderDetailModal.addEventListener("click", (e) => { if (e.target.id === "order-detail-modal") orderDetailModal.style.display = "none"; });
  }

  function getStatusLabel(status) {
    const map = {
      pending: "Chờ xác nhận",
      packing: "Đang chuẩn bị",
      shipping: "Chờ giao hàng",
      delivered: "Đã giao",
      cancelled: "Đã hủy"
    };
    return map[status] || "Chờ xác nhận";
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "userOrders") {
      try {
        orders = JSON.parse(localStorage.getItem("userOrders")) || [];
        renderAllTabs();
      } catch (e) {
        console.error("Lỗi khi parse userOrders:", e);
      }
    }
  });
});
