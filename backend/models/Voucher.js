// backend/models/Voucher.js
const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Nhãn hiển thị không được để trống"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Tên voucher không được để trống"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Mô tả không được để trống"],
    },
    expirationDate: {
      type: Date,
      required: [true, "Ngày hết hạn không được để trống"],
    },
    image_url: {
      type: String,
      required: [true, "Ảnh minh họa không được để trống"],
    },
    code: {
      type: String,
      required: [true, "Mã voucher không được để trống"],
      unique: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      required: [true, "Loại giảm giá không được để trống"],
    },
    discountValue: {
      type: Number,
      required: [true, "Giá trị giảm không được để trống"],
      min: [0, "Giá trị giảm không được âm"],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate giá trị giảm giá theo phần trăm
VoucherSchema.pre("save", function (next) {
  if (this.discountType === "percent" && this.discountValue > 100) {
    next(new Error("Giảm giá theo phần trăm không được vượt quá 100%"));
  }
  next();
});

module.exports = mongoose.model("Voucher", VoucherSchema);
