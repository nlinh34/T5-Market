import { VoucherAPI } from "../../APIs/voucherAPI.js";
import { VoucherForm } from "./voucherForm.js";

export class VoucherList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.voucherForm = new VoucherForm();
    this.initialize();
  }

  initialize() {
    this.loadVouchers();
    document.getElementById("addVoucherBtn").onclick = () => {
      this.voucherForm.openModal(null, () => this.loadVouchers());
    };
  }

  async loadVouchers() {
    try {
      const result = await VoucherAPI.getAllVouchers();
      if (result.success) {
        this.renderVouchers(result.data);
      } else {
        throw new Error(result.message || "Không thể tải danh sách voucher");
      }
    } catch (error) {
      console.error("Load vouchers error:", error);
      this.container.innerHTML =
        '<p class="error">Có lỗi xảy ra khi tải danh sách voucher</p>';
    }
  }

  renderVouchers(vouchers) {
    const html = `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Nhãn</th>
                            <th>Tên</th>
                            <th>Hình ảnh</th>
                            <th>Mã</th>
                            <th>Loại giảm giá</th>
                            <th>Giá trị</th>
                            <th>Ngày hết hạn</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vouchers
                          .map((voucher) => this.renderVoucherRow(voucher))
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
    this.container.innerHTML = html;

    this.container.querySelectorAll(".edit-btn").forEach((button) => {
      button.onclick = (e) => {
        const voucherData = JSON.parse(e.target.dataset.voucher);
        this.voucherForm.openModal(voucherData, () => this.loadVouchers());
      };
    });

    this.container.querySelectorAll(".delete-btn").forEach((button) => {
      button.onclick = (e) => this.handleDelete(e.target.dataset.id);
    });
  }

  renderVoucherRow(voucher) {
    return `
            <tr>
                <td>${voucher.label}</td>
                <td>${voucher.name}</td>
                <td class="product-image">
                    <img loading="lazy" src="${voucher.image_url}" alt="${voucher.name}" 
                         onerror="this.src='../../../assets/images/default-voucher.png'">
                </td>
                <td>${voucher.code}</td>
                <td>${this.getDiscountTypeName(voucher.discountType)}</td>
                <td>${this.formatDiscountValue(
                  voucher.discountType,
                  voucher.discountValue
                )}</td>
                <td>
                    ${new Date(voucher.expirationDate).toLocaleDateString(
                      "vi-VN"
                    )}
                    <br>
                    <small>Tạo bởi: ${
                      voucher.created_by?.fullName || "N/A"
                    }</small>
                </td>
                <td class="action-buttons">
                    <button class="edit-btn" data-voucher='${JSON.stringify(
                      voucher
                    )}'>
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="delete-btn" data-id="${voucher._id}">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
  }

  formatDiscountValue(type, value) {
    if (type === "fixed") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    }
    return `${value}%`;
  }

  getDiscountTypeName(type) {
    const types = {
      fixed: "Giảm giá cố định",
      percent: "Giảm theo %",
    };
    return types[type] || type;
  }

  async handleDelete(voucherId) {
    if (confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      try {
        const result = await VoucherAPI.deleteVoucher(voucherId);
        if (result.success) {
          alert("Xóa voucher thành công!");
          this.loadVouchers();
        } else {
          alert(result.message || "Có lỗi xảy ra!");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Có lỗi xảy ra khi xóa voucher!");
      }
    }
  }
}
