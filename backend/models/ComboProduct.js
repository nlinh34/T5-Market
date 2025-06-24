const mongoose = require("mongoose");

const ComboProductSchema = new mongoose.Schema(
  {
    combo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Số lượng sản phẩm không được để trống"],
      min: [1, "Số lượng phải lớn hơn 0"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index để đảm bảo không có sự trùng lặp combo_id và product_id
ComboProductSchema.index({ combo_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model("ComboProduct", ComboProductSchema);
