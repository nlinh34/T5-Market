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
  try {
    // Luôn lấy shop từ server để tránh sai shopId
    const res = await ShopAPI.getMyShop();
    if (!res.success || !res.data?._id) {
      localStorage.removeItem("shopId");
      alert("Không tìm thấy thông tin shop. Vui lòng đăng nhập lại.");
      window.location.href = "/login.html";
      return;
    }

    const shopId = res.data._id;
    localStorage.setItem("shopId", shopId);

    const orderRes = await OrderAPI.getOrdersByShop(shopId);
    if (orderRes.success) {
      orders = orderRes.data;
    } else {
      alert(orderRes.error || "Không thể tải danh sách đơn hàng");
    }
  } catch (err) {
    console.error("Lỗi khi loadOrders:", err);
    alert("Lỗi kết nối. Vui lòng thử lại.");
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
      <div style="display:flex; gap:15px; margin-bottom:15px;">
        <div style="position: relative;">
          <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #1ea7e8; z-index: 1;"></i>
          <input type="text" id="search-code" placeholder="Tìm mã đơn..." style="padding-left: 40px;">
        </div>
        <div style="position: relative; flex: 1;">
          <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #1ea7e8; z-index: 1;"></i>
          <input type="text" id="search-name" placeholder="Tìm tên khách hàng..." style="padding-left: 40px;">
        </div>
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
        const actionBtn = `<button class="action-btn action-detail" data-index="${order._index}"><i class="fas fa-eye"></i> Chi tiết</button>`;

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
      pending: '<i class="fas fa-clock"></i> Chờ xác nhận',
      confirmed: '<i class="fas fa-box-open"></i> Đang chuẩn bị',
      shipped: '<i class="fas fa-shipping-fast"></i> Đang giao hàng',
      delivered: '<i class="fas fa-check-circle"></i> Đã giao hàng',
      cancelled: '<i class="fas fa-times-circle"></i> Đã hủy đơn',
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

    // Log product information for debugging
    items.forEach((item, index) => {
      console.log(`Sản phẩm ${index + 1}:`, item.name, item.image);
    });

    const content = `
    <h3><i class="fas fa-clipboard-list"></i> Chi tiết đơn hàng</h3>
    <div style="background: #ffffff; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid rgba(0, 112, 243, 0.1);">
      <p><strong style="color: #1ea7e8;"><i class="fas fa-user"></i> Tên KH:</strong> ${order.shippingInfo?.fullName || "—"}</p>
      <p><strong style="color: #1ea7e8;"><i class="fas fa-phone"></i> SĐT:</strong> ${order.shippingInfo?.phone || "—"}</p>
      <p><strong style="color: #1ea7e8;"><i class="fas fa-map-marker-alt"></i> Địa chỉ:</strong> ${order.shippingInfo?.address || "—"}</p>
      <p><strong style="color: #1ea7e8;"><i class="fas fa-sticky-note"></i> Ghi chú:</strong> <em>${order.shippingInfo?.note || "Không có ghi chú cho đơn hàng này."}</em></p>
      <p><strong style="color: #1ea7e8;"><i class="fas fa-credit-card"></i> Phương thức thanh toán:</strong> ${order.paymentMethod || "cod"}</p>
    </div>
    <h4 style="color: #1ea7e8; margin-bottom: 15px;"><i class="fas fa-shopping-cart"></i> Sản phẩm đã đặt</h4>
   ${items.map(item => `
  <div style="display: flex; align-items: center; margin-bottom: 15px; gap: 15px; padding: 15px; background: #ffffff; border-radius: 10px; border: 1px solid rgba(0, 112, 243, 0.1);">
    <img loading="lazy" src="${item.image}" alt="${item.name}" 
      style="width: 70px; height: 70px; object-fit: cover; border-radius: 10px;" />
    <div style="flex: 1;">
      <strong style="color: #333; font-size: 16px;">${item.name}</strong><br />
      <span style="color: #666; font-size: 14px;"><i class="fas fa-cubes"></i> Số lượng: <strong>${item.quantity}</strong></span><br />
      <span style="color: #1ea7e8; font-weight: 600; font-size: 15px;"><i class="fas fa-tag"></i> ${item.price.toLocaleString()}đ</span>
    </div>
  </div>
`).join("")}

    <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 2px solid rgba(0, 112, 243, 0.2);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span><i class="fas fa-calculator"></i> <strong>Tạm tính:</strong></span>
        <span style="font-weight: 600; color: #1ea7e8">${subtotal.toLocaleString()}đ</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span ><i class="fas fa-percent"></i> <strong>Đã giảm:</strong></span>
        <span style="color: #1ea7e8; font-weight: 600;">${discount > 0 ? discount.toLocaleString() + "đ" : "0đ"}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgb(0 255 10 / 11%); border-radius: 8px; ">
        <span style="color: #159300; font-size: 18px;"><i class="fas fa-money-bill-wave"></i> <strong>Tổng tiền:</strong></span>
        <span style="color: #159300; font-weight: bold; font-size: 20px;">${order.totalAmount?.toLocaleString() || "0"}đ</span>
      </div>
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
