// frontend/pages/admin/js/users/userList.js
import { UserAPI } from "../../APIs/userAPI.js";

const roleDisplayVN = {
  0: "Quản trị viên",
  1: "Quản lý",
  2: "MOD kiểm duyệt",
  3: "Chủ cửa hàng",
  4: "Nhân viên",
  5: "Khách hàng",
};

const statusDisplayVN = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

const accountStatusDisplayVN = {
  green: "An toàn",
  yellow: "Hạn chế",
  orange: "Cảnh báo",
  red: "Bị khóa",
};

export class UsersList {

  constructor(containerId) {
  this.container = document.getElementById(containerId);
  this.currentPage = 1;
  this.limit = 10;
  this.initUsersList();
}

showDeleteModal(userId) {
  const modal = document.getElementById("deleteUserModal");
  modal.classList.add("active");

  // Gán userId vào nút xác nhận
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  confirmBtn.onclick = async () => {
    try {
      await UserAPI.deleteUser(userId);
      modal.classList.remove("active");
      this.initUsersList(); // Refresh danh sách
    } catch (error) {
      console.error("Xóa người dùng thất bại:", error);
      alert("Không thể xóa người dùng. Vui lòng thử lại.");
    }
  };
}


async initUsersList() {
  try {
    this.renderLoading();
    const result = await UserAPI.getAllUsers(this.currentPage, this.limit);
    console.log("API trả về:", result);
    const users = result.data || [];
    this.totalPages = result.totalPages || 1;

    this.renderUsersList(users);
    this.renderPagination();
  } catch (error) {
    console.error("Error initializing users list:", error);
    this.renderError("Không thể tải danh sách người dùng!");
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
              <th>Xác thực</th>
              <th>Trạng thái</th>
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

  renderPagination() {
  const paginationHTML = `
    <div class="pagination">
      <button id="prevPage" ${this.currentPage === 1 ? "disabled" : ""}><i class="fas fa-chevron-left"></i></button>
      <span>Trang ${this.currentPage} / ${this.totalPages}</span>
      <button id="nextPage" ${this.currentPage === this.totalPages ? "disabled" : ""}><i class="fas fa-chevron-right"></i></button>
    </div>
  `;

  // Thêm phân trang vào cuối danh sách
  this.container.insertAdjacentHTML("beforeend", paginationHTML);

  document.getElementById("prevPage").addEventListener("click", () => {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.initUsersList();
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.initUsersList();
    }
  });
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
        <td class="ellipsis">${user.fullName || "Chưa cập nhật"}</td>
        <td class="ellipsis">${user.email || "Chưa cập nhật"}</td>
        <td>${roleDisplayVN[user.role] || "Chưa cập nhật"}</td>
        <td>${statusDisplayVN[user.status] || "Chưa cập nhật"}</td>
        <td>${accountStatusDisplayVN[user.accountStatus] || "Chưa cập nhật"}</td>
        <td>
          <div class="action-buttons">
            <button class="delete-btn" data-id="${user._id}">
                <i class="fas fa-trash"></i>
            </button>
          </div>
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
    this.container.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const userId = e.currentTarget.dataset.id;
        this.showDeleteModal(userId);
      });
    });

  }

  
}
