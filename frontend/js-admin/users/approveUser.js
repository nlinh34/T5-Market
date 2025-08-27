// approveUserListContainer.js
import { UserAPI } from "../../APIs/userAPI.js";
import { showNotification } from "../../APIs/utils/notification.js";

const roleDisplayVN = {
  0: "Quản trị viên",
  1: "Quản lý",
  2: "MOD kiểm duyệt",
  3: "Chủ cửa hàng",
  4: "Nhân viên",
  5: "Khách hàng",
};

const accountStatusDisplayVN = {
  green: "An toàn",
  yellow: "Hạn chế",
  orange: "Cảnh báo",
  red: "Bị khóa",
};

export class ApproveUserList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentPage = 1;
    this.limit = 10;
    this.initApproveUsersList();
  }

  async initApproveUsersList() {
    try {
      this.renderLoading();
      const result = await UserAPI.getAllUsers(this.currentPage, this.limit);
      const users = (result.data || []).filter(user => user.status === "pending");
      this.totalPages = 1; // Không phân trang nếu lọc thủ công
      this.renderUsersList(users);
    } catch (error) {
      console.error("Error loading pending users:", error);
      this.renderError("Không thể tải danh sách người dùng chờ duyệt!");
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Đang tải danh sách người dùng...</p>
      </div>
    `;
  }

  renderError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button id="retryBtn" class="retry-btn">Thử lại</button>
      </div>
    `;
    document.getElementById("retryBtn").addEventListener("click", () => {
      this.initApproveUsersList();
    });
  }

  renderUsersList(users) {
    if (!users.length) {
      this.container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-user-clock"></i>
          <p>Không có người dùng chờ duyệt</p>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Thời gian đăng ký</th>
              <th>Tên tài khoản</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái tài khoản</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((user, index) => this.renderUserRow(user)).join("")}
          </tbody>
        </table>
      </div>
    `;

    this.container.innerHTML = tableHTML;
    this.addEventListeners();
  }

  renderUserRow(user) {
    return `
      <tr>
        <td>${
          user.createdAt
            ? new Date(user.createdAt).toLocaleString("vi-VN")
            : "Không có"
        }</td>
        <td class="ellipsis">${user.fullName || "Chưa cập nhật"}</td>
        <td class="ellipsis">${user.email || "Chưa cập nhật"}</td>
        <td>${roleDisplayVN[user.role] || "Chưa cập nhật"}</td>
        <td>${accountStatusDisplayVN[user.accountStatus] || "Chưa cập nhật"}</td>
        <td>
          <div class="action-buttons">
            <button class="approve-btn" data-id="${user._id}">
              <i class="fas fa-check"></i> Duyệt
            </button>
            <button class="reject-btn" data-id="${user._id}">
              <i class="fas fa-times"></i> Từ chối
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  addEventListeners() {
    this.container.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const userId = e.currentTarget.dataset.id;
        try {
          await UserAPI.updateUserStatus(userId, "approve");
          showNotification("Đã duyệt người dùng.", "success", "fas fa-check-circle");
          this.initApproveUsersList();
        } catch (err) {
          showNotification("Lỗi khi duyệt người dùng.", "error", "fas fa-times-circle");
        }
      });
    });

    this.container.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const userId = e.currentTarget.dataset.id;
        try {
          await UserAPI.updateUserStatus(userId, "reject");
          showNotification("Đã từ chối người dùng.", "warning", "fas fa-ban");
          this.initApproveUsersList();
        } catch (err) {
          showNotification("Lỗi khi từ chối người dùng.", "error", "fas fa-times-circle");
        }
      });
    });
  }
}
