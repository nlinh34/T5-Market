// frontend/pages/admin/js/vouchers/voucherForm.js
import { VoucherAPI } from "../../../../APIs/voucherAPI.js";

export class VoucherForm {
  constructor() {
    this.modal = document.getElementById("voucherModal");
    this.form = document.getElementById("voucherForm");
    this.initialize();
  }

  initialize() {
    const closeBtn = this.modal.querySelector(".close");
    const cancelBtn = this.modal.querySelector(".btn-cancel");

    closeBtn.onclick = () => this.closeModal();
    cancelBtn.onclick = () => this.closeModal();

    this.form.onsubmit = (e) => this.handleSubmit(e);
  }

  openModal(voucherData = null, onSuccess = null) {
    this.onSuccess = onSuccess;
    this.form.reset();

    if (voucherData) {
      document.getElementById("voucherId").value = voucherData._id;
      document.getElementById("label").value = voucherData.label;
      document.getElementById("name").value = voucherData.name;
      document.getElementById("description").value = voucherData.description;
      document.getElementById("expirationDate").value =
        voucherData.expirationDate.split("T")[0];
      document.getElementById("image_url").value = voucherData.image_url;
      document.getElementById("code").value = voucherData.code;
      document.getElementById("discountType").value = voucherData.discountType;
      document.getElementById("discountValue").value =
        voucherData.discountValue;
      document.getElementById("modalTitle").textContent = "Cập Nhật Voucher";
    } else {
      document.getElementById("voucherId").value = "";
      document.getElementById("modalTitle").textContent = "Thêm Voucher Mới";
    }
    this.modal.style.display = "block";
  }

  closeModal() {
    this.modal.style.display = "none";
    this.form.reset();
  }

  async handleSubmit(e) {
    e.preventDefault();

    const voucherData = {
      label: document.getElementById("label").value,
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      expirationDate: document.getElementById("expirationDate").value,
      image_url: document.getElementById("image_url").value,
      code: document.getElementById("code").value,
      discountType: document.getElementById("discountType").value,
      discountValue: Number(document.getElementById("discountValue").value),
    };

    const voucherId = document.getElementById("voucherId").value;

    try {
      let result;
      if (voucherId) {
        result = await VoucherAPI.updateVoucher(voucherId, voucherData);
      } else {
        result = await VoucherAPI.createVoucher(voucherData);
      }

      if (result.success) {
        this.closeModal();
        if (this.onSuccess) {
          this.onSuccess();
        }
      } else {
        alert(result.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Có lỗi xảy ra khi lưu voucher!");
    }
  }
}
