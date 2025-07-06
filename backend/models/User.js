const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const { Role } = require("../constants/roleEnum");

// Định nghĩa schema User
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      enum: Object.values(Role), //Admin, quản lý, mod, người bán, nhân viên, khách hàng
      default: Role.CUSTOMER, // Mặc định là customer khi đăng ký
    },
    gender: {
      type: String,
      required: false
    },
    dateofbirth: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"], // Chờ xác thực - Đã xác thực - Từ chối
      default: "pending", // Mới đăng ký, đang chờ duyệt
    },
    accountStatus: {
      type: String,
      enum: ["green", "yellow", "orange", "red"], // Trạng thái cảnh báo tài khoản: An toàn - Hạn chế - Cảnh báo - Đã khóa
      default: "green", // Mặc định là tài khoản không vi phạm (an toàn)
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Lưu ID người duyệt tài khoản
      required: false, // Có thể không có trong giai đoạn chờ duyệt
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      required: false,
      default: "",
    },
  },
  { timestamps: true }
);

// Tạo compound index cho phone
UserSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    // Chỉ áp dụng unique khi phone có giá trị
    partialFilterExpression: { phone: { $type: "string" } },
  }
);

// Hash password trước khi lưu
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức so sánh password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Tạo mô hình User
const User = mongoose.model("User", UserSchema);

module.exports = User;
