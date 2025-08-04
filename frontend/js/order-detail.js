document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".sidebar-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  let orders = JSON.parse(localStorage.getItem("userOrders")) || [];
  let currentPage = 1;
  const itemsPerPage = 6;

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const selectedTab = btn.dataset.tab;
      document.getElementById(`tab-${selectedTab}`).classList.add("active");
      if (selectedTab === "all") {
        currentPage = 1;
        renderTab(selectedTab, currentPage);
      } else {
        renderTab(selectedTab);
      }
    });
  });

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

  function renderTab(type, page = 1) {
    const container = document.getElementById(`tab-${type}`);
    let html = "";

    html += `<div class="table-wrapper"><table class="order-table">
      <thead>
        <tr>
          <th>Mã đơn</th>
          <th>Ngày</th>
          <th>Tên KH</th>
          <th>Thanh toán</th>
          <th>Trạng thái</th>`;

    if (type === "all") {
      html += `<th>Thao tác</th>`;
    }

    html += `</tr></thead><tbody>`;

    let filtered = orders
      .map((o, i) => ({ ...o, _index: i }))
      .filter(order => {
        const status = order.status || "pending";
        return type === "all"
          || (type === "pending" && status === "pending")
          || (type === "packing" && status === "packing")
          || (type === "shipping" && status === "shipping")
          || (type === "delivered" && status === "delivered")
          || (type === "cancelled" && status === "cancelled");
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalPages = type === "all" ? Math.ceil(filtered.length / itemsPerPage) : 1;
    const start = (page - 1) * itemsPerPage;
    const paginated = type === "all" ? filtered.slice(start, start + itemsPerPage) : filtered;

    if (paginated.length === 0) {
      html += `<tr><td colspan="6">Không có đơn hàng.</td></tr>`;
    } else {
      paginated.forEach(order => {
        const idx = order._index;
        const date = new Date(order.createdAt).toLocaleString();
        const status = getStatusLabel(order.status);
        html += `<tr>
          <td>#${order.code || idx + 1}</td>
          <td>${date}</td>
          <td>${order.shippingInfo?.fullName || ""}</td>
          <td>${order.paymentMethod || ""}</td>
          <td><span class="status-label status-${order.status}">${status}</span></td>`;

        if (type === "all") {
          html += `<td><div class="order-actions">`;

          html += `<button class="view-detail-btn" data-index="${idx}">Xem chi tiết</button>`;

          if (order.status !== "cancelled" && order.status !== "delivered") {
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
      if (page > 1) {
        html += `<button class="page-btn" data-page="${page - 1}">← Trước</button>`;
      }
      html += `<span>Trang ${page} / ${totalPages}</span>`;
      if (page < totalPages) {
        html += `<button class="page-btn" data-page="${page + 1}">Sau →</button>`;
      }
      html += `</div>`;
    }

    container.innerHTML = html;

    if (type === "all") {
      document.querySelectorAll(".cancel-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.index);
          document.getElementById("cancel-reason").value = "";
          document.getElementById("cancel-modal").style.display = "flex";
          document.getElementById("cancel-confirm").onclick = () => confirmCancel(idx);
        });
      });

      document.querySelectorAll(".page-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const newPage = parseInt(btn.dataset.page);
          renderTab("all", newPage);
        });
      });

      document.querySelectorAll(".view-detail-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.index);
          const order = orders[idx];
          let itemsHtml = "";
          if (order.order?.items?.length) {
            itemsHtml = order.order.items.map(item => {
              const image = item.image_url?.startsWith("http")
                ? item.image_url
                : item.image_url
                ? `https://t5-market.onrender.com/uploads/${item.image_url}`
                : "https://via.placeholder.com/80x80?text=No+Image";

              return `
                <div class="product-row">
                  <img loading="lazy" src="${image}" alt="${item.name}" class="product-img" />
                  <div class="product-info">
                    <div class="product-name">${item.name}</div>
                    <div class="product-qty">Số lượng: <strong>${item.quantity}</strong></div>
                    <div class="product-price">${item.price.toLocaleString()}đ</div>
                  </div>
                </div>
              `;
            }).join("");
          }

          const sub = order.order?.subTotal || 0;
          const discount = order.order?.discount || 0;
          const total = order.order?.totalAmount || sub;

          const modalContent = `
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

          document.getElementById("order-detail-content").innerHTML = modalContent;
          document.getElementById("order-detail-modal").style.display = "flex";
        });
      });
    }
  }

  function confirmCancel(idx) {
    const reason = document.getElementById("cancel-reason").value.trim();
    if (!reason) {
      alert("Vui lòng nhập lý do.");
      return;
    }
    orders[idx].status = "cancelled";
    orders[idx].cancelReason = reason;
    localStorage.setItem("userOrders", JSON.stringify(orders));
    document.getElementById("cancel-modal").style.display = "none";
    renderAllTabs();
  }

  document.getElementById("cancel-close").addEventListener("click", () => {
    document.getElementById("cancel-modal").style.display = "none";
  });
  document.getElementById("cancel-modal").addEventListener("click", e => {
    if (e.target.id === "cancel-modal") {
      e.target.style.display = "none";
    }
  });

  document.querySelector("#order-detail-modal .modal-close").addEventListener("click", () => {
    document.getElementById("order-detail-modal").style.display = "none";
  });
  document.getElementById("order-detail-modal").addEventListener("click", e => {
    if (e.target.id === "order-detail-modal") {
      e.target.style.display = "none";
    }
  });

  function renderAllTabs() {
    ["pending", "packing", "shipping", "delivered", "cancelled"].forEach(renderTab);
    renderTab("all", currentPage);
  }

  renderAllTabs();

  // Lắng nghe khi có thay đổi từ tab khác (ví dụ: seller thay đổi đơn hàng)
window.addEventListener("storage", (event) => {
  if (event.key === "userOrders") {
    try {
      orders = JSON.parse(localStorage.getItem("userOrders")) || [];
      renderAllTabs(); // Cập nhật toàn bộ giao diện
    } catch (e) {
      console.error("Lỗi khi parse userOrders:", e);
    }
  }
});
function adjustSidebarHeight() {
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content-area');
  if (sidebar && content) {
    sidebar.style.minHeight = content.offsetHeight + 'px';
  }
}

window.addEventListener("load", adjustSidebarHeight);
window.addEventListener("resize", adjustSidebarHeight);

});
