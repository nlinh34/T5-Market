import OrderAPI from "../APIs/orderAPI.js";
import { ShopAPI } from "../APIs/shopAPI.js"

document.addEventListener("DOMContentLoaded", async () => {
  const tabButtons = document.querySelectorAll(".sidebar-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  let orders = [];
  let currentAllPage = 1;
  const itemsPerPage = 6;
  let searchCode = "";
  let searchName = "";
  let debounceTimer;

  await loadOrders();
  renderAllTabs();

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const selectedTab = btn.dataset.tab;
      document.getElementById(`tab-${selectedTab}`).classList.add("active");
      if (selectedTab === "all") renderAllTabWithPagination();
    });
  });

  async function loadOrders() {
    let shopId = localStorage.getItem("shopId");

    if (!shopId) {
      try {
        const res = await ShopAPI.getMyShop();
        if (res.success && res.data?._id) {
          shopId = res.data._id;
          localStorage.setItem("shopId", shopId);
          console.log("✅ Đã lưu shopId:", shopId);
        } else {
          alert("❌ Không tìm thấy thông tin shop. Vui lòng đăng nhập lại.");
          return;
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy shopId:", error);
        alert("Lỗi khi lấy thông tin shop. Vui lòng thử lại.");
        return;
      }
    }

    const res = await OrderAPI.getOrdersByShop(shopId);
    if (res.success) {
      orders = res.data;
    } else {
      alert(res.error || "Không thể tải danh sách đơn hàng");
    }
  }

  function renderAllTabs() {
    const tabs = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    tabs.forEach((tab) => {
      const tabDiv = document.getElementById(`tab-${tab}`);
      if (tabDiv) {
        tabDiv.innerHTML = renderTable(tab);
      }
    });
    renderAllTabWithPagination();
  }

  function renderAllTabWithPagination() {
    const tabAll = document.getElementById("tab-all");
    tabAll.innerHTML = renderTable("all", currentAllPage);
    attachEvents();

    const codeInput = document.getElementById("search-code");
    const nameInput = document.getElementById("search-name");

    if (codeInput && nameInput) {
      codeInput.value = searchCode;
      nameInput.value = searchName;

      codeInput.addEventListener("input", handleSearchInput);
      nameInput.addEventListener("input", handleSearchInput);
    }

    document.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentAllPage = parseInt(btn.dataset.page);
        renderAllTabWithPagination();
      });
    });

    function handleSearchInput() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchCode = codeInput.value.trim();
        searchName = nameInput.value.trim();
        currentAllPage = 1;
        renderAllTabWithPagination();
      }, 400);
    }
  }

  function renderTable(type, page = 1) {
    let html = "";

    if (type === "all") {
      html += `
      <div style="display:flex; gap:10px; margin-bottom:10px;">
        <input type="text" id="search-code" placeholder="Tìm mã đơn...">
        <input type="text" id="search-name" placeholder="Tìm tên khách hàng...">
      </div>`;
    }

    html += `<table class="order-table"><thead><tr>
      <th>Mã đơn</th><th>Thời gian</th><th>Tên KH</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th>
    </tr></thead><tbody>`;

    let filtered = orders
      .map((o, i) => ({ ...o, _index: i }))
      .filter((order) => {
        const status = order.status;
        const matchTab = type === "all" || type === status;

        if (!matchTab) return false;

        if (type === "all") {
          const code = (order.orderCode || "").toLowerCase();
          const name = (order.shippingInfo?.fullName || "").toLowerCase();
          return code.includes(searchCode.toLowerCase()) && name.includes(searchName.toLowerCase());
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const start = (page - 1) * itemsPerPage;
    const paginated = type === "all" ? filtered.slice(start, start + itemsPerPage) : filtered;

    if (paginated.length === 0) {
      html += `<tr><td colspan="6">Không có đơn hàng</td></tr>`;
    } else {
      paginated.forEach((order) => {
        const statusLabel = `<span class="status-label status-${order.status}">${getStatusLabel(order.status)}</span>`;
        const updateBtn = renderStatusUpdateButton(order, type);
        const actionBtn = `<button class="action-btn action-detail" data-index="${order._index}"><i class="fa fa-eye" aria-hidden="true"></i></button>`;

        html += `<tr>
          <td>${order.orderCode}</td>
          <td>${new Date(order.createdAt).toLocaleString()}</td>
          <td>${order.shippingInfo?.fullName || ""}</td>
          <td>${order.paymentMethod || ""}</td>
          <td>${statusLabel}</td>
          <td>${updateBtn}${actionBtn}</td>
        </tr>`;
      });
    }

    html += "</tbody></table>";

    if (type === "all") {
      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      if (totalPages > 1) {
        html += `<div class="pagination">`;
        if (page > 1) html += `<button class="page-btn" data-page="${page - 1}">←</button>`;
        html += `<span>Trang ${page} / ${totalPages}</span>`;
        if (page < totalPages) html += `<button class="page-btn" data-page="${page + 1}">→</button>`;
        html += `</div>`;
      }
    }

    return html;
  }

  // ✅ ĐÃ SỬA để chỉ hiện nút cập nhật nếu đúng tab
  function renderStatusUpdateButton(order, tabType) {
    const nextStatus = {
      pending: "confirmed",
      confirmed: "shipped",
      shipped: "delivered",
    };

    const next = nextStatus[order.status];
    if (!next || tabType !== order.status) return "";

    return `<button class="action-btn action-update" data-id="${order._id}" data-status="${next}">
      → ${getStatusLabel(next)}
    </button>`;
  }

  function getStatusLabel(status) {
    const map = {
      pending: "Chờ xác nhận",
      confirmed: "Đang chuẩn bị",
      shipped: "Đang giao hàng",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy đơn",
    };
    return map[status] || status;
  }

  function attachEvents() {
    document.querySelectorAll(".action-detail").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        showOrderModal(orders[index]);
      });
    });

    document.querySelectorAll(".action-update").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const orderId = btn.dataset.id;
        const status = btn.dataset.status;
        const res = await OrderAPI.updateOrderStatus(orderId, status);
        if (res.success) {
          await loadOrders();
          renderAllTabs();
        } else {
          alert("Cập nhật trạng thái thất bại");
        }
      });
    });
  }

  function showOrderModal(order) {
    const items = order.products || [];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = order.totalAmount || subtotal;
    const discount = subtotal - total;

    // In thử từng item để kiểm tra ảnh
    items.forEach((item, index) => {
      console.log(`🖼 Sản phẩm ${index + 1}:`, item.name, item.image);
    });

    const content = `
    <h3><i class="fas fa-clipboard-list"></i> Chi tiết đơn hàng</h3>
    <p><strong>Tên KH:</strong> ${order.shippingInfo?.fullName || "—"}</p>
    <p><strong>SĐT:</strong> ${order.shippingInfo?.phone || "—"}</p>
    <p><strong>Địa chỉ:</strong> ${order.shippingInfo?.address || "—"}</p>
    <p><strong>Ghi chú:</strong> <em>${order.shippingInfo?.note || "Không có ghi chú cho đơn hàng này."}</em> </p>
    <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod || "cod"}</p>
    <p><i class="fas fa-box"></i> <strong>Sản phẩm đã đặt</strong></p>
    <hr/>
   ${items.map(item => `
  <div style="display: flex; align-items: center; margin-bottom: 12px; gap: 10px;">
    <img src="${item.image}" alt="${item.name}" 
      style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />
    <div>
      <strong>${item.name}</strong><br />
      x${item.quantity} – ${item.price.toLocaleString()}đ
    </div>
  </div>
`).join("")}

    <hr/>
    <div style="border-top: 1px dashed #ccc; padding-top: 10px;">
      <p><strong>Tạm tính:</strong> ${subtotal.toLocaleString()}đ</p>
  <p><strong>Đã giảm:</strong> ${discount > 0 ? discount.toLocaleString() + "đ" : "0đ"}</p>
      <p><strong style="color:red;">Tổng tiền:</strong> <strong style="color:red;">${order.totalAmount?.toLocaleString() || "0"}đ</strong></p>
    </div>
  `;

    const modal = document.getElementById("order-detail-modal");
    modal.querySelector("#order-detail-content").innerHTML = content;
    modal.style.display = "flex";

    modal.querySelector(".modal-close").addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target.id === "order-detail-modal") {
        modal.style.display = "none";
      }
    });
  }


});
