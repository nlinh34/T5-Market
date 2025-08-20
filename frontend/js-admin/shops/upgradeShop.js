import { ShopAPI } from "../../APIs/shopAPI.js";
import { showNotification } from "../../APIs/utils/notification.js";

export class ApproveShopList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.initApproveShopList();
  }

  async initApproveShopList() {
    try {
      this.renderLoading();
      const result = await ShopAPI.getPendingShops();
      const shops = result.data || [];
      this.renderShopList(shops);
    } catch (error) {
      console.error("Lỗi khi load danh sách shop:", error);
      this.renderError("Không thể tải danh sách cửa hàng chờ duyệt!");
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Đang tải danh sách cửa hàng...</p>
      </div>
    `;
  }

  renderError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <p>${message}</p>
        <button id="retryBtn" class="retry-btn">Thử lại</button>
      </div>
    `;
    document.getElementById("retryBtn").addEventListener("click", () => {
      this.initApproveShopList();
    });
  }

  renderShopList(shops) {
    if (!shops.length) {
      this.container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-store-slash"></i>
          <p>Không có cửa hàng chờ duyệt</p>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Ngày gửi</th>
              <th>Tên cửa hàng</th>
              <th>Chủ cửa hàng</th>
              <th>SĐT</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${shops.map((shop) => this.renderShopRow(shop)).join("")}
          </tbody>
        </table>
      </div>
    `;
    this.container.innerHTML = tableHTML;
    this.addEventListeners();
  }

  renderShopRow(shop) {
    return `
      <tr>
        <td>${new Date(shop.createdAt).toLocaleString("vi-VN")}</td>
        <td class="ellipsis">${shop.name}</td>
        <td class="ellipsis">${shop.owner?.fullName || "Không rõ"}</td>
        <td>${shop.phone}</td>
        <td class="ellipsis">${shop.description || "Không mô tả"}</td>
        <td>
          <div class="action-buttons">
            <button class="approve-btn" data-id="${shop._id}"><i class="fas fa-check"></i> Duyệt</button>
            <button class="reject-btn" data-id="${shop._id}"><i class="fas fa-times"></i> Từ chối</button>
          </div>
        </td>
      </tr>
    `;
  }

  addEventListeners() {
    this.container.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const shopId = e.currentTarget.dataset.id;
        try {
          await ShopAPI.approveShop(shopId);
          showNotification("Đã duyệt cửa hàng.", "success", "fas fa-check-circle");
          this.initApproveShopList();
        } catch (err) {
          showNotification("Lỗi khi duyệt cửa hàng.", "error", "fas fa-times-circle");
        }
      });
    });

    this.container.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const shopId = e.currentTarget.dataset.id;
        try {
          await ShopAPI.rejectShop(shopId); // nếu có API từ chối
          showNotification("Đã từ chối cửa hàng.", "warning", "fas fa-ban");
          this.initApproveShopList();
        } catch (err) {
          showNotification("Lỗi khi từ chối cửa hàng.", "error", "fas fa-times-circle");
        }
      });
    });
  }
}
