const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
}, { _id: false }); 

const ShopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
    policies: [PolicySchema], 
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
            enum: ['manage_products', 'manage_orders'],
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
