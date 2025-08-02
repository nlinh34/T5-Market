document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".sidebar-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  let orders = JSON.parse(localStorage.getItem("userOrders")) || [];
  let currentAllPage = 1;
  const itemsPerPage = 6;
  let searchCode = "";
  let searchName = "";
  let debounceTimer;

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const selectedTab = btn.dataset.tab;
      document.getElementById(`tab-${selectedTab}`).classList.add("active");
      if (selectedTab === "all") renderAllTabWithPagination();
    });
  });

  function renderTable(type, page = 1) {
    let html = "";

    if (type === "all") {
      html += `
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
        <input type="text" id="search-code" placeholder="Tìm mã đơn...">
        <input type="text" id="search-name" placeholder="Tìm tên khách hàng...">
      </div>`;
    }

    html += `<table class="order-table">
      <thead><tr>`;

    if (type === "cancelled") {
      html += `<th>Mã đơn</th><th>Thời gian</th><th>Tên KH</th><th>Thanh toán</th><th>Lý do</th><th>Trạng thái</th>`;
    } else {
      html += `<th>Mã đơn</th><th>Thời gian</th><th>Tên KH</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th>`;
    }

    html += `</tr></thead><tbody>`;

    let filtered = orders.map((o, i) => ({ ...o, _index: i }))
      .filter(order => {
        const status = order.status || "pending";
        const isMatchTab =
          type === "all"
          || (type === "pending" && status === "pending")
          || (type === "packing" && status === "packing")
          || (type === "shipping" && status === "shipping")
          || (type === "delivered" && status === "delivered")
          || (type === "cancelled" && status === "cancelled");

        if (!isMatchTab) return false;

        if (type === "all") {
          const code = (order.code || order._index + 1).toString().toLowerCase();
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
      paginated.forEach(order => {
        const realIndex = order._index;
        const status = order.status || "pending";
        const date = new Date(order.createdAt).toLocaleString();
        const fullName = order?.shippingInfo?.fullName || "";
        const method = order.paymentMethod || "";
        const statusLabel = `<span class='status-label status-${status}'>${getStatusLabel(status)}</span>`;

        const detailButton = `<button class='action-btn action-detail' data-index='${realIndex}'>Chi tiết đơn</button>`;

        let actions = "";
        if (type === "pending" && status === "pending") {
          actions = `<button class='action-btn action-confirm' data-action='toPacking' data-index='${realIndex}'>Xác nhận</button>
                     <button class='action-btn action-cancel' data-action='cancel' data-index='${realIndex}'>Huỷ</button>`;
        } else if (type === "packing" && status === "packing") {
          actions = `<button class='action-btn action-confirm' data-action='toShipping' data-index='${realIndex}'>Xác nhận giao</button>`;
        } else if (type === "shipping" && status === "shipping") {
          actions = `<button class='action-btn action-confirm' data-action='toDelivered' data-index='${realIndex}'>Xác nhận đã giao</button>`;
        }

        if (type === "cancelled") {
          html += `<tr>
            <td>#${order.code || realIndex + 1}</td>
            <td>${date}</td>
            <td>${fullName}</td>
            <td>${method}</td>
            <td>${order.cancelReason ? order.cancelReason : "—"}</td>
            <td>${statusLabel}</td>
          </tr>`;
        } else {
          html += `<tr>
            <td>#${order.code || realIndex + 1}</td>
            <td>${date}</td>
            <td>${fullName}</td>
            <td>${method}</td>
            <td>${statusLabel}</td>`;
          if (type === "all") {
            html += `<td>${detailButton}</td>`;
          } else {
            html += `<td>${actions}</td>`;
          }
          html += `</tr>`;
        }
      });
    }

    html += `</tbody></table>`;

    if (type === "all") {
      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      if (totalPages > 1) {
        html += `<div class="pagination">`;
        if (page > 1) {
          html += `<button class="page-btn" data-page="${page - 1}">←</button>`;
        }
        html += `<span>Trang ${page} / ${totalPages}</span>`;
        if (page < totalPages) {
          html += `<button class="page-btn" data-page="${page + 1}">→</button>`;
        }
        html += `</div>`;
      }
    }

    return html;
  }

  function getStatusLabel(status) {
    const map = {
      pending: "Chờ duyệt",
      packing: "Đang chuẩn bị",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy"
    };
    return map[status] || "Chưa rõ";
  }

  function renderAllTabs() {
    const tabs = ["pending", "packing", "shipping", "delivered", "cancelled"];
    tabs.forEach(tab => {
      const tabDiv = document.getElementById(`tab-${tab}`);
      tabDiv.innerHTML = renderTable(tab);
    });
    renderAllTabWithPagination();
  }

  function renderAllTabWithPagination() {
    const tabAll = document.getElementById("tab-all");
    tabAll.innerHTML = renderTable("all", currentAllPage);
    attachEventListeners();

    const codeInput = document.getElementById("search-code");
    const nameInput = document.getElementById("search-name");

    if (codeInput && nameInput) {
      codeInput.value = searchCode;
      nameInput.value = searchName;

      codeInput.addEventListener("input", handleSearchInput);
      nameInput.addEventListener("input", handleSearchInput);
    }

    function handleSearchInput() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchCode = codeInput.value.trim();
        searchName = nameInput.value.trim();
        currentAllPage = 1;
        renderAllTabWithPagination();
      }, 400);
    }

    document.querySelectorAll(".page-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentAllPage = parseInt(btn.dataset.page);
        renderAllTabWithPagination();
      });
    });
  }

  function attachEventListeners() {
    document.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);

        switch (action) {
          case "toPacking":
            orders[index].status = "packing";
            break;
          case "toShipping":
            orders[index].status = "shipping";
            break;
          case "toDelivered":
            orders[index].status = "delivered";
            break;
          case "cancel":
            const reason = prompt("Lý do hủy đơn hàng:");
            if (!reason) return;
            orders[index].status = "cancelled";
            orders[index].cancelReason = reason;
            break;
        }

        localStorage.setItem("userOrders", JSON.stringify(orders));
        renderAllTabs();
      });
    });

    document.querySelectorAll(".action-detail").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        const order = orders[index];

        let productsHtml = "";
        if (order.order?.items?.length) {
          productsHtml = order.order.items.map(item => {
            const image = item.image_url?.startsWith("http")
              ? item.image_url
              : item.image_url
              ? `http://127.0.0.1:5000/uploads/${item.image_url}`
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
          <hr/>
          <p><strong>Tên KH:</strong> ${order.shippingInfo?.fullName || ""}</p>
          <p><strong>SĐT:</strong> ${order.shippingInfo?.phoneNumber || ""}</p>
          <p><strong>Địa chỉ:</strong> ${order.shippingInfo?.fullAddress || ""}</p>
          <p><strong>Ghi chú:</strong> ${order.shippingInfo?.note || ""}</p>
          <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod || ""}</p>
          <hr/>
          <h4><i class="fas fa-box-open"></i> Thông tin đơn hàng</h4>
          <div class="product-list">${productsHtml}</div>
          <hr/>
          <div class="summary-row"><span>Tạm tính:</span><strong>${sub.toLocaleString()}đ</strong></div>
          <div class="summary-row"><span>Đã giảm:</span><strong>${discount.toLocaleString()}đ</strong></div>
          <div class="summary-row total"><span>Tổng tiền:</span><strong>${total.toLocaleString()}đ</strong></div>
        `;

        document.getElementById("order-detail-content").innerHTML = modalContent;
        document.getElementById("order-detail-modal").style.display = "flex";
      });
    });

    document.querySelector(".modal-close").addEventListener("click", () => {
      document.getElementById("order-detail-modal").style.display = "none";
    });

    document.getElementById("order-detail-modal").addEventListener("click", e => {
      if (e.target.id === "order-detail-modal") {
        e.target.style.display = "none";
      }
    });
  }

  renderAllTabs();
});
