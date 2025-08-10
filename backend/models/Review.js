const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: { type: Date, default: Date.now }
});

reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true }); // Mỗi user chỉ đánh giá 1 lần/sp/đơn

module.exports = mongoose.model("Review", reviewSchema);
