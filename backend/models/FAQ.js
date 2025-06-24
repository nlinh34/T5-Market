// backend/models/FAQ.js
const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề câu hỏi không được để trống"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Nội dung câu trả lời không được để trống"],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm created_at và updated_at
  }
);

module.exports = mongoose.model("FAQ", FAQSchema);
