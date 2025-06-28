const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

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
      required: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
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
