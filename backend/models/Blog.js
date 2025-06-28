// backend/models/Blog.js
const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tiêu đề blog không được để trống"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Nội dung blog không được để trống"],
    },
    imageUrl: {
      type: String,
      required: [true, "URL hình ảnh không được để trống"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("Blog", BlogSchema);
