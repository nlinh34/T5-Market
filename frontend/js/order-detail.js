import OrderAPI from "../APIs/orderAPI.js";
import { ReviewAPI } from "../APIs/reviewAPI.js";

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".sidebar-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const cancelModal = document.getElementById("cancel-modal");
  const orderDetailModal = document.getElementById("order-detail-modal");
  const reviewModal = document.getElementById("review-modal");

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
    ["pending", "confirmed", "shipped", "delivered", "cancelled"].forEach(renderTab);
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
    <td class="order-code" data-index="${idx}" style="cursor:pointer;color:blue;">
      ${order.orderCode}
    </td>
    <td>${new Date(order.createdAt).toLocaleString()}</td>
    <td>${order.shippingInfo?.fullName || ""}</td>
    <td>${order.paymentMethod || ""}</td>
    <td><span class="status-label status-${order.status}">
      ${getStatusLabel(order.status)}
    </span></td>`;

        if (type === "all") {
          html += `<td>`;
          if (order.status === "delivered") {
            html += `<button class="review-btn" data-index="${idx}">
              <i class="fas fa-star"></i> Đánh giá
            </button>`;
          } else if (["confirmed", "shipped", "cancelled"].includes(order.status)) {
            html += `<button class="view-detail-btn" data-index="${idx}">
              <i class="fas fa-eye"></i> Xem
            </button>`;
          }

          if (order.status === "pending") {
            html += `<button class="cancel-btn" data-index="${idx}">
              <i class="fas fa-times"></i> Hủy đơn
            </button>`;
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
    bindActionButtons();

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

    document.querySelectorAll(".order-code").forEach((el) => {
      el.addEventListener("click", () => {
        console.log("Đã click nút order");
        const idx = parseInt(el.dataset.index);
        showOrderDetail(orders[idx]);
      });
    });

    document.querySelectorAll(".review-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        console.log("orders[idx] = ", orders[idx]); 
        showReviewModal(orders[idx]);
      });
    });
  }

  function showReviewModal(order) {
    const productList = document.getElementById("review-product-list");
    productList.innerHTML = "";

    const items = order.products || order.order?.products || [];
    if (!items.length) {
      productList.innerHTML = `<p>Không có sản phẩm nào để đánh giá.</p>`;
      return;
    }

    items.forEach((item) => {
      const productId = item.productId?._id || item.productId || item._id;
      const image = item.image?.startsWith("http")
        ? item.image
        : item.image
          ? `https://t5-market.onrender.com/uploads/${item.image}`
          : "https://via.placeholder.com/80x80?text=No+Image";

      productList.insertAdjacentHTML(
        "beforeend",
        `
        <div class="review-item" data-product-id="${productId}" style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:6px;">
          <div style="display:flex; align-items:center; gap:10px; border-bottom: 1px solid #ccc; padding-bottom: 10px">
            <img src="${image}" alt="${item.name}" width="60" height="60" style="object-fit:cover; border-radius:6px;" />
            <span style="font-size: 14px"><strong>${item.name}</strong>
            <br />
            <span style="color: #888; font-size: 13px;">Số lượng: ${item.quantity}</span>
        </span>
            </span>
          </div>
          <div class="review-stars" style="">
            ${[1, 2, 3, 4, 5].map(v => `
              <i class="fas fa-star star" data-value="${v}"></i>
            `).join("")}
            <input type="hidden" class="review-rating" value="5" />
          </div>
      <textarea class="review-content" placeholder="Nhập nội dung đánh giá..."></textarea>
      <div class="submit-btn-container">
        <button class="submit-product-review-btn">
          <i class="fas fa-paper-plane"></i> Gửi đánh giá
        </button>
      </div>
    `
      );

ReviewAPI.getReviewedProductsByOrder(order._id).then(res => {
  if (res.success) {
    const reviewedList = res.data; 

    reviewedList.forEach(reviewed => {
      const productId = reviewed.product;

      const btn = productList.querySelector(
        `.review-item[data-product-id="${productId}"] .submit-product-review-btn`
      );
      if (btn) {
        btn.remove()
      }
      const starContainer = productList.querySelector(
        `.review-item[data-product-id="${productId}"] .review-stars`
      );
      if (starContainer) {
        const stars = starContainer.querySelectorAll(".star");
        stars.forEach((star, index) => {
          if (index < reviewed.rating) {
            star.style.color = "#f5b301"; 
          } else {
            star.style.color = "#ccc"; 
          }
        });
      }

      const textarea = productList.querySelector(
        `.review-item[data-product-id="${productId}"] textarea`
      );
      if (textarea) {
        textarea.value = reviewed.comment;
        textarea.readOnly = true;
      }
    });
  }
});


    });

    reviewModal.style.display = "flex";
    productList.querySelectorAll(".review-item").forEach(item => {
      const stars = item.querySelectorAll(".star");
      const ratingInput = item.querySelector(".review-rating");

      stars.forEach(star => {
        star.addEventListener("click", () => {
          const value = parseInt(star.dataset.value);
          ratingInput.value = value;
          stars.forEach(s => {
            if (parseInt(s.dataset.value) <= value) {
              s.style.color = "#ffc107";
              s.classList.add('selected');
            } else {
              s.style.color = "#ddd";
              s.classList.remove('selected');
            }
          });
        });
      });
    });
    document.querySelectorAll(".submit-product-review-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const container = btn.closest(".review-item");
        const productId = container.dataset.productId;
        const rating = parseInt(container.querySelector(".review-rating").value);
        const comment = container.querySelector(".review-content").value.trim();

        if (!comment) return alert("Vui lòng nhập nội dung đánh giá.");
        if (!rating || rating < 1 || rating > 5) return alert("Chọn số sao hợp lệ.");

        try {
          const { success, error } = await ReviewAPI.createReview({
            productId,
            orderId: order._id,
            rating,
            comment,
          });

          if (success) {
            alert("Đánh giá thành công!");
            btn.disabled = true;
            btn.textContent = "Đã gửi";
          } else {
            alert("Lỗi gửi đánh giá: " + error);
          }
        } catch (err) {
          console.error("Lỗi gửi đánh giá:", err);
          alert("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
      });
    });
  }

  function showOrderDetail(order) {
    let subTotal = 0;
    const itemsHtml = order.products?.map(item => {
      const image = item.image?.startsWith("http")
        ? item.image
        : item.image
          ? `https://t5-market.onrender.com/uploads/${item.image}`
          : "https://via.placeholder.com/80x80?text=No+Image";

      const itemTotal = item.price * item.quantity;
      subTotal += itemTotal;
      return `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <img loading="lazy" src="${image}" alt="${item.name}" class="product-img" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />
        <div>
          <strong>${item.name}</strong><br />
          x${item.quantity} – ${item.price.toLocaleString()}đ
        </div>
      </div>`;
    }).join("") || "";

    const discount = 0; 
    const total = subTotal - discount;

    document.getElementById("order-detail-content").innerHTML = `
      <h3><i class="fas fa-file-invoice"></i> Chi tiết đơn hàng</h3>
      <div style="background: rgba(51, 194, 255, 0.02); border: 2px solid rgba(51, 194, 255, 0.1); border-radius: 12px; padding: 10px 20px; margin: 10px 0;">
        <p><strong><i class="fas fa-user"></i> Tên KH:</strong> ${order.shippingInfo?.fullName || ""}</p>
        <p><strong><i class="fas fa-phone"></i> SĐT:</strong> ${order.shippingInfo?.phone || ""}</p>
        <p><strong><i class="fas fa-map-marker-alt"></i> Địa chỉ:</strong> ${order.shippingInfo?.address || ""}</p>
        <p><strong><i class="fas fa-sticky-note"></i> Ghi chú:</strong> ${order.shippingInfo?.note || "Không có ghi chú cho đơn hàng này."}</p>
        <p><strong><i class="fas fa-credit-card"></i> Phương thức thanh toán:</strong> ${order.paymentMethod || ""}</p>
      </div>
      <h4><i class="fas fa-shopping-cart"></i> Sản phẩm đã đặt</h4>
      <div class="product-list">${itemsHtml}</div>
      <hr/>
      <div class="summary-row"><span><i class="fas fa-calculator"></i> Tạm tính:</span><strong>${subTotal.toLocaleString()}đ</strong></div>
      <div class="summary-row"><span><i class="fas fa-percent"></i> Đã giảm:</span><strong>${discount.toLocaleString()}đ</strong></div>
      <div class="summary-row total"><span><i class="fas fa-money-bill-wave"></i> Tổng tiền:</span><strong>${total.toLocaleString()}đ</strong></div>
    `;
    orderDetailModal.style.display = "flex";
  }
  async function confirmCancel(index) {
    const reasonInput = document.getElementById("cancel-reason");
    const reason = reasonInput.value.trim();
    if (!reason) return alert("Vui lòng nhập lý do.");

    const order = orders[index];
    const orderId = order._id;

    try {
      const { success, error } = await OrderAPI.cancelOrder(orderId, reason);
      if (!success) return alert("Hủy đơn thất bại: " + error);

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

    document.querySelector("#review-modal .modal-close").onclick = () => reviewModal.style.display = "none";
    reviewModal.addEventListener("click", (e) => { if (e.target.id === "review-modal") reviewModal.style.display = "none"; });
  }

  function getStatusLabel(status) {
    const map = {
      pending: "Chờ xác nhận",
      confirmed: "Đang chuẩn bị",
      shipped: "Đang giao hàng",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy đơn"
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
