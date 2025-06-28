// frontend/pages/admin/js/users/userList.js
import { UserAPI } from "../../../../APIs/userAPI.js";

export class UsersList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.initUsersList();
  }

  async initUsersList() {
    try {
      this.renderLoading();
      const users = await this.fetchUsers();
      this.renderUsersList(users);
      console.log(users);
    } catch (error) {
      console.error("Error initializing users list:", error);
      this.renderError("Không thể tải danh sách người dùng!");
    }
  }

  async fetchUsers() {
    try {
      const result = await UserAPI.getAllUsers();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
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
      this.initUsersList();
    });
  }

  renderUsersList(users) {
    if (!users || users.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users"></i>
          <p>Không có người dùng nào</p>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <div class="table-actions">
        <div class="search-bar">
          <input type="text" id="userSearch" placeholder="Tìm kiếm người dùng...">
          <i class="fas fa-search"></i>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Thời gian đăng ký</th>
              <th>Tên tài khoản</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Tình trạng</th>
              <th>Trạng thái tài khoản</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${users
              .map((user, index) =>
                this.renderUserRow(user, index + 1)
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    this.container.innerHTML = tableHTML;

    // Add event listeners
    this.addEventListeners();
  }

  renderUserRow(user, index) {
    return `
      <tr>
        <td>${
            user.createdAt && user.createdAt instanceof Date
              ? user.createdAt.toLocaleString("vi-VN")
              : user.createdAt
                ? new Date(user.createdAt).toLocaleString("vi-VN")
                : "Không có"
          }
        </td>
        <td>${user.fullName || "Chưa cập nhật"}</td>
        <td>${user.email || "Chưa cập nhật"}</td>
        <td>${user.role || "Chưa cập nhật"}</td>
        <td>${user.status}</td>
        <td>${user.accountStatus}</td>
        <td>
          <button class="view-user"><i class="fa fa-eye"></i></button>
        </td>
      </tr>
    `;
  }

  

  addEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("userSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = this.container.querySelectorAll("tbody tr");

        rows.forEach((row) => {
          const fullName = row.children[1].textContent.toLowerCase();
          const phone = row.children[2].textContent.toLowerCase();
          const email = row.children[3].textContent.toLowerCase();

          if (
            fullName.includes(searchTerm) ||
            phone.includes(searchTerm) ||
            email.includes(searchTerm)
          ) {
            row.style.display = "";
          } else {
            row.style.display = "none";
          }
        });
      });
    }
  }
}
