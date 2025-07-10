const mongoose = require("mongoose");

// Create a separate schema for the policy items for clarity and robustness.
const PolicySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
}, { _id: false }); // No need for a separate _id for each policy item.

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
    policies: [PolicySchema], // Use the defined sub-schema here
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
    staffs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    //Lí do và người từ chối 
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    staff: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        permissions: [
          {
            type: String,
            enum: ['manage_products', 'manage_orders', 'view_reports', 'chat_support'],
          },
        ],
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
