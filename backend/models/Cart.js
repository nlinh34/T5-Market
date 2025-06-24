const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  }
});

const CartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: [cartItemSchema], // Danh sách sản phẩm trong giỏ hàng

    voucher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null
    },
    subtotal: {
      type: Number,
      default: 0
    },
    shipping_fee: {
      type: Number,
      default: 15000
    },
    discount_amount: {
      type: Number,
      default: 0
    },
    total_amount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
