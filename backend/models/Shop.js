const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // mỗi user chỉ sở hữu 1 shop
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // Chờ admin duyệt
    },
    shopStatus: {
      type: String,
      enum: ["green", "yellow", "orange", "red"], // Trạng thái cảnh báo tài khoản: An toàn - Hạn chế - Cảnh báo - Đã khóa
      default: "green", // Mặc định là tài khoản không vi phạm (an toàn)
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin duyệt
    },
    staffs: [ {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    } ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
